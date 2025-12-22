/**
 * Utility for money formatting and comparison
 */

export function formatMoney(amount: string, currency: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function compareMoney(a: string, b: string): number {
  return parseFloat(a) - parseFloat(b);
}

