import { FelRepository } from '../../domain/ports/FelRepository';
import { FelConfig, FelConfigProps } from '../../domain/entities/FelConfig';
import { query } from '../database/postgres';

export class PostgresFelRepository implements FelRepository {

    async findConfigByBranchId(branchId: number): Promise<FelConfig | null> {
        const result = await query(`
      SELECT 
        id_config as id, id_sucursal as "branchId",
        proveedor_certificador as "certifierProvider", nit_certificador as "certifierNit",
        usuario_certificador as "certifierUser", token_firma as "authToken",
        url_endpoint as "endpointUrl", url_backup as "backupUrl",
        ambiente as "environmentType", afiliacion_iva as "ivaAffiliation",
        codigo_establecimiento as "establishmentCode", activo as "isActive",
        fecha_activacion as "activationDate", fecha_vencimiento as "expirationDate",
        fecha_creacion as "createdAt"
      FROM config_fel
      WHERE id_sucursal = $1 AND activo = TRUE
    `, [branchId]);

        if (result.rows.length === 0) return null;
        return new FelConfig(result.rows[0] as FelConfigProps);
    }

    async saveConfig(config: FelConfig): Promise<FelConfig> {
        if (config.id) {
            // Update
            await query(`
        UPDATE config_fel SET
          proveedor_certificador = $1, nit_certificador = $2, usuario_certificador = $3,
          token_firma = $4, url_endpoint = $5, url_backup = $6, ambiente = $7,
          afiliacion_iva = $8, codigo_establecimiento = $9, activo = $10,
          fecha_activacion = $11, fecha_vencimiento = $12
        WHERE id_config = $13
      `, [
                config.props.certifierProvider, config.props.certifierNit, config.props.certifierUser,
                config.props.authToken, config.props.endpointUrl, config.props.backupUrl,
                config.environmentType, config.props.ivaAffiliation, config.props.establishmentCode,
                config.props.isActive, config.props.activationDate, config.props.expirationDate,
                config.id
            ]);
            return config;
        } else {
            // Insert
            const result = await query(`
        INSERT INTO config_fel (
          id_sucursal, proveedor_certificador, nit_certificador, usuario_certificador,
          token_firma, url_endpoint, url_backup, ambiente, afiliacion_iva,
          codigo_establecimiento, activo, fecha_activacion, fecha_vencimiento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id_config as id, fecha_creacion as "createdAt"
      `, [
                config.props.branchId, config.props.certifierProvider, config.props.certifierNit,
                config.props.certifierUser, config.props.authToken, config.props.endpointUrl,
                config.props.backupUrl, config.environmentType, config.props.ivaAffiliation,
                config.props.establishmentCode, config.props.isActive,
                config.props.activationDate, config.props.expirationDate
            ]);

            const newProps = { ...config.props, ...result.rows[0] };
            return new FelConfig(newProps);
        }
    }
}
