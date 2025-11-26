import { CompanyRepository } from '../../domain/ports/company.repository';
import { Company } from '../../domain/entities/company.entity';
import { Branch } from '../../domain/entities/branch.entity';
import { query } from '../database/postgres';

export class PostgresCompanyRepository implements CompanyRepository {
    async getCompany(): Promise<Company | null> {
        const result = await query(
            `SELECT 
        id_empresa as id, nombre_comercial as "tradeName", razon_social as "businessName",
        nit, telefono as phone, email, sitio_web as website, logo_url as "logoUrl",
        fecha_constitucion as "constitutionDate", activa as "isActive", fecha_creacion as "createdAt"
       FROM empresa LIMIT 1`
        );
        if (result.rows.length === 0) return null;
        return new Company(result.rows[0]);
    }

    async save(company: Company): Promise<Company> {
        const result = await query(
            `INSERT INTO empresa (
        nombre_comercial, razon_social, nit, telefono, email, sitio_web, logo_url, fecha_constitucion
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_empresa as id`,
            [
                company.tradeName,
                company.businessName,
                company.nit,
                company.props.phone,
                company.props.email,
                company.props.website,
                company.props.logoUrl,
                company.props.constitutionDate,
            ]
        );
        return new Company({ ...company.props, id: result.rows[0].id });
    }

    async update(company: Company): Promise<Company> {
        await query(
            `UPDATE empresa SET 
        nombre_comercial = $1, razon_social = $2, nit = $3, telefono = $4,
        email = $5, sitio_web = $6, logo_url = $7, fecha_constitucion = $8,
        activa = $9
       WHERE id_empresa = $10`,
            [
                company.tradeName,
                company.businessName,
                company.nit,
                company.props.phone,
                company.props.email,
                company.props.website,
                company.props.logoUrl,
                company.props.constitutionDate,
                company.props.isActive,
                company.id,
            ]
        );
        return company;
    }

    async findBranchById(id: number): Promise<Branch | null> {
        const result = await query(
            `SELECT 
        id_sucursal as id, id_empresa as "companyId", codigo_sucursal as code,
        nombre as name, direccion as address, departamento, municipio,
        telefono as phone, email, es_matriz as "isHeadquarters", activa as "isActive",
        fecha_apertura as "openingDate", fecha_creacion as "createdAt"
       FROM sucursales WHERE id_sucursal = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new Branch(result.rows[0]);
    }

    async findAllBranches(): Promise<Branch[]> {
        const result = await query(
            `SELECT 
        id_sucursal as id, id_empresa as "companyId", codigo_sucursal as code,
        nombre as name, direccion as address, departamento, municipio,
        telefono as phone, email, es_matriz as "isHeadquarters", activa as "isActive",
        fecha_apertura as "openingDate", fecha_creacion as "createdAt"
       FROM sucursales`
        );
        return result.rows.map((row) => new Branch(row));
    }

    async saveBranch(branch: Branch): Promise<Branch> {
        const result = await query(
            `INSERT INTO sucursales (
        id_empresa, codigo_sucursal, nombre, direccion, departamento, municipio,
        telefono, email, es_matriz, fecha_apertura
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_sucursal as id`,
            [
                branch.props.companyId,
                branch.code,
                branch.name,
                branch.props.address,
                branch.props.department,
                branch.props.municipality,
                branch.props.phone,
                branch.props.email,
                branch.isHeadquarters,
                branch.props.openingDate,
            ]
        );
        return new Branch({ ...branch.props, id: result.rows[0].id });
    }

    async updateBranch(branch: Branch): Promise<Branch> {
        await query(
            `UPDATE sucursales SET 
        codigo_sucursal = $1, nombre = $2, direccion = $3, departamento = $4,
        municipio = $5, telefono = $6, email = $7, es_matriz = $8,
        activa = $9, fecha_apertura = $10
       WHERE id_sucursal = $11`,
            [
                branch.code,
                branch.name,
                branch.props.address,
                branch.props.department,
                branch.props.municipality,
                branch.props.phone,
                branch.props.email,
                branch.isHeadquarters,
                branch.props.isActive,
                branch.props.openingDate,
                branch.id,
            ]
        );
        return branch;
    }
}
