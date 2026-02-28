export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return n.toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
}

export function formatPercent(n: number, decimals = 0): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
