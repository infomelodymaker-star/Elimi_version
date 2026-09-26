/**
 * Input sanitization and data validation utilities.
 * Prevents HTML injection, script tags, SQL/NoSQL payload injections, and validates numeric order ranges.
 */

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>'"`;]/g, '')   // Remove dangerous characters
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.length <= 120 ? trimmed : '';
}

export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^\d+()\s-]/g, '').trim().slice(0, 30);
}

export function sanitizeNumber(value: unknown, min = 0, max = 1000000000, fallback = 0): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}
