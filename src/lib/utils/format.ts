/**
 * Format a number as a French-style score
 * Example: 14.5 → "14,5"
 */
export function formatScore(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a percentage in French
 * Example: 72.5 → "72,5 %"
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format a progress fraction
 * Example: (14.5, 20) → "14,5 / 20"
 */
export function formatFraction(value: number, total: number): string {
  return `${formatScore(value)} / ${formatScore(total)}`;
}

/**
 * Generate a random activation code
 * Format: LM-XXXXXX (6 alphanumeric uppercase chars)
 */
export function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded: I, O, 0, 1 to avoid confusion
  let code = 'LM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Pluralize a French word (simple version)
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count <= 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
