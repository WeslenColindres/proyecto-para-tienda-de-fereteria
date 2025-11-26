import { ISupplierRepository } from '../../../domain/repositories/ISupplierRepository';
import { Supplier } from '../../../domain/entities/Supplier';
import { query } from '../../database/postgres';

export class PostgresSupplierRepository implements ISupplierRepository {
    async save(supplier: Supplier): Promise<void> {
        const data = supplier.toJSON();
        const sql = `
      INSERT INTO proveedores (
        nit, nombre, nombre_comercial, email, telefono, direccion, dias_entrega, activo, fecha_registro
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW()
      )
      ON CONFLICT (nit) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        nombre_col mercia= EXCLUDED.nombre_comercial,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        direccion = EXCLUDED.direccion,
        dias_entrega = EXCLUDED.dias_entrega,
        activo = EXCLUDED.activo
    `;

        await query(sql, [
            data.nit,
            data.name,
            data.commercialName,
            data.email,
            data.phone,
            data.address,
            data.creditDays,
            data.status === 'activo'
        ]);
    }

    async findById(id: string): Promise<Supplier | null> {
        const rows = await query('SELECT * FROM proveedores WHERE id_proveedor = $1', [parseInt(id)]);
        if (rows.length === 0) return null;
        return this.mapRowToSupplier(rows[0]);
    }

    async findByNit(nit: string): Promise<Supplier | null> {
        const rows = await query('SELECT * FROM proveedores WHERE nit = $1', [nit]);
        if (rows.length === 0) return null;
        return this.mapRowToSupplier(rows[0]);
    }

    async findAll(): Promise<Supplier[]> {
        const rows = await query('SELECT * FROM proveedores WHERE activo = true');
        return rows.map(row => this.mapRowToSupplier(row));
    }

    private mapRowToSupplier(row: any): Supplier {
        return new Supplier({
            id: String(row.id_proveedor),
            nit: row.nit,
            name: row.nombre,
            commercialName: row.nombre_comercial,
            email: row.email,
            phone: row.telefono,
            address: row.direccion,
            creditDays: row.dias_entrega,
            status: row.activo ? 'activo' : 'inactivo',
            createdAt: row.fecha_registro,
            updatedAt: row.fecha_registro // Assuming no update date col in simple schema
        });
    }
}
