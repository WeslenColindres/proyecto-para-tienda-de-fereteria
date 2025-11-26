import { randomUUID } from 'node:crypto';
import type { StoreSchema } from '../ports/StoreGateway';

export function pushAuditLog(store: StoreSchema, entry: Omit<StoreSchema['auditLogs'][number], 'id' | 'createdAt'>): void {
  store.auditLogs.push({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  });
}
