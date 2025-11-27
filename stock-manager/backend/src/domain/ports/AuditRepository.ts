import { AuditLog } from '../entities/AuditLog';

export interface AuditRepository {
    createAuditLog(log: AuditLog): Promise<void>;
    findAuditLogs(filters: any): Promise<AuditLog[]>;
    findAuditLogsByUserId(userId: number): Promise<AuditLog[]>;
}
