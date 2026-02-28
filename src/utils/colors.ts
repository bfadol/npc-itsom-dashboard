export function statusColor(status: string): string {
  const map: Record<string, string> = {
    critical: 'var(--color-red)',
    high: 'var(--color-orange)',
    medium: 'var(--color-blue)',
    low: 'var(--color-green)',
    down: 'var(--color-red)',
    degraded: 'var(--color-orange)',
    operational: 'var(--color-green-teal)',
    maintenance: 'var(--color-blue)',
  };
  return map[status.toLowerCase()] ?? 'var(--text-secondary)';
}

export function statusBg(status: string): string {
  const map: Record<string, string> = {
    critical: 'rgba(255,90,101,0.20)',
    high: 'rgba(201,123,48,0.20)',
    medium: 'rgba(14,58,130,0.25)',
    low: 'rgba(5,193,104,0.20)',
    down: 'rgba(255,90,101,0.20)',
    degraded: 'rgba(201,123,48,0.20)',
    operational: 'rgba(5,193,104,0.20)',
    maintenance: 'rgba(14,58,130,0.25)',
  };
  return map[status.toLowerCase()] ?? 'rgba(100,120,160,0.15)';
}
