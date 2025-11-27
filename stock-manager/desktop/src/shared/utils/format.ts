const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 0
});

export const numberFormatter = new Intl.NumberFormat('es-GT');

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value).replace(/\u00a0/g, ' ');
}

export const formatMoney = formatCurrency;

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
