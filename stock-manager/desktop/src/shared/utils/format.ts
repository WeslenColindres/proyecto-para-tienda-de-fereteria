const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 0
});

export const numberFormatter = new Intl.NumberFormat('es-GT');

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value).replace(/\u00a0/g, ' ');
}
