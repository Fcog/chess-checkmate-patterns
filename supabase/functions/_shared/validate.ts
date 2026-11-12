const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_EMAIL_LENGTH = 320;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** The address check the form and the server share (FR-002). Expects a normalized address. */
export function isValidEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && EMAIL.test(value);
}

/** A filled-in honeypot field means a bot (FR-016). */
export function isHoneypot(website: unknown): boolean {
  return typeof website === 'string' && website.length > 0;
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
