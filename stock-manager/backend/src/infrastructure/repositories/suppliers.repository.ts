import pool from '../database/postgres';
import { ISupplierRepository, ListSuppliersParams, SupplierListResult, SupplierCatalogs } from '../../domain/repositories/ISupplierRepository';
import { Supplier, SupplierProps, SupplierStatus } from '../../domain/entities/Supplier';
import { SupplierCategory } from '../../domain/entities/SupplierCategory';
import { City } from '../../domain/entities/City';

const mapToEntity = (row: any): Supplier => {
    return new Supplier({
        id: row.id_proveedor.toString(),
        nit: row.nit,
        name: row.nombre,
        commercialName: row.nombre_comercial,
        contactName: row.nombre_contacto,
        email: row.email,
        phone: row.telefono,
        address: row.direccion,
        cityId: row.id_ciudad?.toString(),
        cityName: row.nombre_ciudad,
        categoryId: row.id_categoria_proveedor?.toString(),
        categoryName: row.nombre_categoria,
        creditDays: row.plazo_credito_dias || row.dias_entrega || 0, // Fallback to dias_entrega if plazo not set
        creditLimit: parseFloat(row.limite_credito || '0'),
        status: row.estado_proveedor as SupplierStatus,
        balance: parseFloat(row.saldo_actual || row.saldo_pendiente || '0'),
        overdueDays: row.dias_mora || 0,
        paymentConditions: row.condiciones_pago,
        version: row.version || 1,
        createdBy: row.creado_por?.toString(),
        updatedBy: row.actualizado_por?.toString(),
        deletedAt: row.deleted_at,
        createdAt: row.fecha_registro,
        updatedAt: row.fecha_actualizacion || row.fecha_registro
    });
};

export const SuppliersRepository: ISupplierRepository = {
    async save(supplier: Supplier): Promise<void> {
        const {
            id, nit, name, commercialName, contactName, email, phone, address,
            cityId, categoryId, creditDays, creditLimit, status, paymentConditions,
            version, createdBy, updatedBy
        } = supplier.props;

        if (id) {
            // Optimistic locking: check version
            const result = await pool.query(
                `UPDATE proveedores SET 
                    nit = $1, nombre = $2, nombre_comercial = $3, nombre_contacto = $4, 
                    email = $5, telefono = $6, direccion = $7, id_ciudad = $8, 
                    id_categoria_proveedor = $9, plazo_credito_dias = $10, limite_credito = $11, 
                    estado_proveedor = $12, condiciones_pago = $13, 
                    actualizado_por = $14, version = version + 1, fecha_actualizacion = NOW()
                WHERE id_proveedor = $15 AND version = $16`,
                [
                    nit, name, commercialName, contactName, email, phone, address,
                    cityId, categoryId, creditDays, creditLimit, status, paymentConditions,
                    updatedBy, id, version
                ]
            );

            if (result.rowCount === 0) {
                // Check if record exists to distinguish between 404 and 409
                const exists = await pool.query('SELECT 1 FROM proveedores WHERE id_proveedor = $1', [id]);
                if (exists.rowCount === 0) {
                    throw new Error('Supplier not found');
                } else {
                    const error: any = new Error('Conflict: Supplier has been modified by another user');
                    error.code = 'SUPPLIER_VERSION_CONFLICT';
                    throw error;
                }
            }
        } else {
            await pool.query(
                `INSERT INTO proveedores (
                    nit, nombre, nombre_comercial, nombre_contacto, email, telefono, 
                    direccion, id_ciudad, id_categoria_proveedor, plazo_credito_dias, 
                    limite_credito, estado_proveedor, condiciones_pago, creado_por, version
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1)`,
                [
                    nit, name, commercialName, contactName, email, phone, address,
                    cityId, categoryId, creditDays, creditLimit, status, paymentConditions, createdBy
                ]
            );
        }
    },

    async findById(id: string): Promise<Supplier | null> {
        const result = await pool.query(
            `SELECT p.*, c.nombre as nombre_ciudad, cat.nombre as nombre_categoria 
             FROM proveedores p
             LEFT JOIN ciudades c ON p.id_ciudad = c.id_ciudad
             LEFT JOIN categorias_proveedor cat ON p.id_categoria_proveedor = cat.id_categoria_proveedor
             WHERE p.id_proveedor = $1 AND (p.estado_proveedor != 'eliminado' OR p.estado_proveedor IS NULL)`,
            [id]
        );
        return result.rows[0] ? mapToEntity(result.rows[0]) : null;
    },

    async findByNit(nit: string): Promise<Supplier | null> {
        const result = await pool.query(
            `SELECT * FROM proveedores WHERE nit = $1 AND (estado_proveedor != 'eliminado' OR estado_proveedor IS NULL)`,
            [nit]
        );
        return result.rows[0] ? mapToEntity(result.rows[0]) : null;
    },

    async findAll(params: ListSuppliersParams): Promise<SupplierListResult> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 12;
        const offset = (page - 1) * pageSize;

        let whereClause = "WHERE (p.estado_proveedor != 'eliminado' OR p.estado_proveedor IS NULL)";
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (params.search) {
            whereClause += ` AND (LOWER(p.nombre) LIKE $${paramIndex} OR LOWER(p.nit) LIKE $${paramIndex} OR LOWER(p.nombre_contacto) LIKE $${paramIndex})`;
            queryParams.push(`%${params.search.toLowerCase()}%`);
            paramIndex++;
        }

        if (params.status && params.status !== 'all') {
            whereClause += ` AND p.estado_proveedor = $${paramIndex}`;
            queryParams.push(params.status);
            paramIndex++;
        }

        if (params.cityId && params.cityId !== 'all') {
            whereClause += ` AND p.id_ciudad = $${paramIndex}`;
            queryParams.push(params.cityId);
            paramIndex++;
        }

        if (params.categoryId && params.categoryId !== 'all') {
            whereClause += ` AND p.id_categoria_proveedor = $${paramIndex}`;
            queryParams.push(params.categoryId);
            paramIndex++;
        }

        let orderBy = 'ORDER BY p.nombre ASC';
        if (params.sortBy) {
            const direction = params.sortOrder === 'desc' ? 'DESC' : 'ASC';
            switch (params.sortBy) {
                case 'name': orderBy = `ORDER BY p.nombre ${direction}`; break;
                case 'nit': orderBy = `ORDER BY p.nit ${direction}`; break;
                case 'balance': orderBy = `ORDER BY p.saldo_actual ${direction}`; break;
                case 'creditDays': orderBy = `ORDER BY p.plazo_credito_dias ${direction}`; break;
                case 'status': orderBy = `ORDER BY p.estado_proveedor ${direction}`; break;
            }
        }

        const dataQuery = `
            SELECT p.*, c.nombre as nombre_ciudad, cat.nombre as nombre_categoria 
            FROM proveedores p
            LEFT JOIN ciudades c ON p.id_ciudad = c.id_ciudad
            LEFT JOIN categorias_proveedor cat ON p.id_categoria_proveedor = cat.id_categoria_proveedor
            ${whereClause}
            ${orderBy}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const countQuery = `SELECT COUNT(*) as total FROM proveedores p ${whereClause}`;

        const countersQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE estado_proveedor = 'activo') as activo,
                COUNT(*) FILTER (WHERE estado_proveedor = 'inactivo') as inactivo,
                COUNT(*) FILTER (WHERE estado_proveedor = 'moroso') as moroso,
                COUNT(*) FILTER (WHERE estado_proveedor = 'bloqueado') as bloqueado
            FROM proveedores
            WHERE estado_proveedor != 'eliminado' OR estado_proveedor IS NULL
        `;

        const [dataResult, countResult, countersResult] = await Promise.all([
            pool.query(dataQuery, [...queryParams, pageSize, offset]),
            pool.query(countQuery, queryParams),
            pool.query(countersQuery)
        ]);

        return {
            data: dataResult.rows.map(mapToEntity),
            total: parseInt(countResult.rows[0].total),
            page,
            pageSize,
            counters: {
                activo: parseInt(countersResult.rows[0].activo || 0),
                inactivo: parseInt(countersResult.rows[0].inactivo || 0),
                moroso: parseInt(countersResult.rows[0].moroso || 0),
                bloqueado: parseInt(countersResult.rows[0].bloqueado || 0)
            }
        };
    },

    async softDelete(id: string): Promise<void> {
        await pool.query(
            "UPDATE proveedores SET estado_proveedor = 'eliminado', deleted_at = NOW() WHERE id_proveedor = $1",
            [id]
        );
    },

    async restore(id: string): Promise<void> {
        await pool.query(
            "UPDATE proveedores SET estado_proveedor = 'activo', deleted_at = NULL WHERE id_proveedor = $1",
            [id]
        );
    },

    async updateBalance(id: string, balance: number): Promise<void> {
        await pool.query(
            'UPDATE proveedores SET saldo_actual = $1 WHERE id_proveedor = $2',
            [balance, id]
        );
    },

    async getCatalogs(): Promise<SupplierCatalogs> {
        const [cities, categories] = await Promise.all([
            pool.query('SELECT * FROM ciudades ORDER BY nombre'),
            pool.query('SELECT * FROM categorias_proveedor WHERE activa = true ORDER BY nombre')
        ]);

        return {
            cities: cities.rows.map(r => new City({
                id: r.id_ciudad.toString(),
                name: r.nombre,
                department: r.departamento,
                country: r.pais
            })),
            categories: categories.rows.map(r => new SupplierCategory({
                id: r.id_categoria_proveedor.toString(),
                code: r.codigo,
                name: r.nombre,
                description: r.descripcion,
                active: r.activa
            }))
        };
    },

    async getReport(params: { from?: string; to?: string }): Promise<any> {
        let whereClause = "WHERE (estado_proveedor != 'eliminado' OR estado_proveedor IS NULL)";
        const queryParams: any[] = [];

        if (params.from) {
            whereClause += ` AND fecha_registro >= $${queryParams.length + 1}`;
            queryParams.push(params.from);
        }
        if (params.to) {
            whereClause += ` AND fecha_registro <= $${queryParams.length + 1}`;
            queryParams.push(params.to);
        }

        const result = await pool.query(
            `SELECT * FROM proveedores ${whereClause} ORDER BY fecha_registro DESC`,
            queryParams
        );

        return {
            data: result.rows.map(mapToEntity),
            total: result.rowCount
        };
    }
};
