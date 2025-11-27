import { AccountingRepository } from '../../domain/ports/AccountingRepository';
import { Account, AccountProps } from '../../domain/entities/Account';
import { AccountingPeriod, AccountingPeriodProps } from '../../domain/entities/AccountingPeriod';
import { CostCenter, CostCenterProps } from '../../domain/entities/CostCenter';
import { query } from '../database/postgres';

export class PostgresAccountingRepository implements AccountingRepository {

    // Accounts
    async findAllAccounts(): Promise<Account[]> {
        const result = await query(`
      SELECT 
        id_cuenta as id, codigo_cuenta as code, nombre_cuenta as name, 
        id_cuenta_padre as "parentId", nivel as level, tipo_cuenta as type,
        naturaleza as nature, acepta_movimiento as "acceptsMovement",
        requiere_centro_costo as "requiresCostCenter", requiere_tercero as "requiresThirdParty",
        activa as "isActive", descripcion as description,
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
      FROM plan_cuentas
      ORDER BY codigo_cuenta ASC
    `);
        return result.rows.map(row => new Account(row as AccountProps));
    }

    async findAccountById(id: number): Promise<Account | null> {
        const result = await query(`
      SELECT 
        id_cuenta as id, codigo_cuenta as code, nombre_cuenta as name, 
        id_cuenta_padre as "parentId", nivel as level, tipo_cuenta as type,
        naturaleza as nature, acepta_movimiento as "acceptsMovement",
        requiere_centro_costo as "requiresCostCenter", requiere_tercero as "requiresThirdParty",
        activa as "isActive", descripcion as description,
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
      FROM plan_cuentas WHERE id_cuenta = $1
    `, [id]);

        if (result.rows.length === 0) return null;
        return new Account(result.rows[0] as AccountProps);
    }

    async findAccountByCode(code: string): Promise<Account | null> {
        const result = await query(`
      SELECT 
        id_cuenta as id, codigo_cuenta as code, nombre_cuenta as name, 
        id_cuenta_padre as "parentId", nivel as level, tipo_cuenta as type,
        naturaleza as nature, acepta_movimiento as "acceptsMovement",
        requiere_centro_costo as "requiresCostCenter", requiere_tercero as "requiresThirdParty",
        activa as "isActive", descripcion as description,
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
      FROM plan_cuentas WHERE codigo_cuenta = $1
    `, [code]);

        if (result.rows.length === 0) return null;
        return new Account(result.rows[0] as AccountProps);
    }

    async createAccount(account: Account): Promise<Account> {
        const result = await query(`
      INSERT INTO plan_cuentas (
        codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta,
        naturaleza, acepta_movimiento, requiere_centro_costo, requiere_tercero,
        activa, descripcion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id_cuenta as id, fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
    `, [
            account.code, account.name, account.props.parentId, account.props.level,
            account.type, account.nature, account.props.acceptsMovement,
            account.props.requiresCostCenter, account.props.requiresThirdParty,
            account.isActive, account.props.description
        ]);

        const newProps = { ...account.props, ...result.rows[0] };
        return new Account(newProps);
    }

    async updateAccount(account: Account): Promise<Account> {
        const result = await query(`
      UPDATE plan_cuentas SET
        nombre_cuenta = $1, id_cuenta_padre = $2, nivel = $3, tipo_cuenta = $4,
        naturaleza = $5, acepta_movimiento = $6, requiere_centro_costo = $7,
        requiere_tercero = $8, activa = $9, descripcion = $10,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_cuenta = $11
      RETURNING fecha_modificacion as "updatedAt"
    `, [
            account.name, account.props.parentId, account.props.level, account.type,
            account.nature, account.props.acceptsMovement, account.props.requiresCostCenter,
            account.props.requiresThirdParty, account.isActive, account.props.description,
            account.id
        ]);

        const newProps = { ...account.props, ...result.rows[0] };
        return new Account(newProps);
    }

    // Cost Centers
    async findAllCostCenters(): Promise<CostCenter[]> {
        const result = await query(`
      SELECT 
        id_centro_costo as id, codigo, nombre as name, descripcion as description,
        id_sucursal as "branchId", responsable, activo as "isActive",
        fecha_creacion as "createdAt"
      FROM centros_costo
      ORDER BY codigo ASC
    `);
        return result.rows.map(row => new CostCenter(row as CostCenterProps));
    }

    async createCostCenter(costCenter: CostCenter): Promise<CostCenter> {
        const result = await query(`
      INSERT INTO centros_costo (
        codigo, nombre, descripcion, id_sucursal, responsable, activo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_centro_costo as id, fecha_creacion as "createdAt"
    `, [
            costCenter.code, costCenter.name, costCenter.props.description,
            costCenter.props.branchId, costCenter.props.responsible, costCenter.isActive
        ]);

        const newProps = { ...costCenter.props, ...result.rows[0] };
        return new CostCenter(newProps);
    }

    // Periods
    async findPeriodByYearAndMonth(year: number, month: number): Promise<AccountingPeriod | null> {
        const result = await query(`
      SELECT 
        id_periodo as id, anio as year, mes as month, nombre as name,
        fecha_inicio as "startDate", fecha_fin as "endDate", estado as status,
        cierre_fiscal as "isFiscalYearClosed", fecha_creacion as "createdAt",
        fecha_modificacion as "updatedAt"
      FROM periodos_contables
      WHERE anio = $1 AND mes = $2
    `, [year, month]);

        if (result.rows.length === 0) return null;
        return new AccountingPeriod(result.rows[0] as AccountingPeriodProps);
    }

    async createPeriod(period: AccountingPeriod): Promise<AccountingPeriod> {
        const result = await query(`
      INSERT INTO periodos_contables (
        anio, mes, nombre, fecha_inicio, fecha_fin, estado, cierre_fiscal
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_periodo as id, fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
    `, [
            period.props.year, period.props.month, period.name,
            period.props.startDate, period.props.endDate, period.status,
            period.props.isFiscalYearClosed
        ]);

        const newProps = { ...period.props, ...result.rows[0] };
        return new AccountingPeriod(newProps);
    }

    async closePeriod(id: number): Promise<void> {
        await query(`
      UPDATE periodos_contables SET estado = 'CERRADO', fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_periodo = $1
    `, [id]);
    }
}
