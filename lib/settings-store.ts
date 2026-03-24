/**
 * Shared settings store backed by localStorage.
 * All functions are safe to call from client components.
 */

export function getStandardHoldDays(): number {
  if (typeof window === 'undefined') return 10;
  const stored = localStorage.getItem('standardHoldDays');
  return stored ? parseInt(stored, 10) : 10;
}

export function setStandardHoldDays(days: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('standardHoldDays', String(days));
}
