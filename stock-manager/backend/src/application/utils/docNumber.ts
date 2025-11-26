import type { StoreSchema } from '../ports/StoreGateway';

export function generateDocNumber(store: StoreSchema, prefix = 'FAC'): string {
  const last = store.sales[store.sales.length - 1];
  if (!last) return `${prefix}-000001`;

  const [storedPrefix, seq] = last.docNumber.split('-');
  const basePrefix = storedPrefix || prefix;
  const num = parseInt(seq || '0', 10) + 1;
  return `${basePrefix}-${num.toString().padStart(6, '0')}`;
}

