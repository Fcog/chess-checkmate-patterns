import { describe, expect, it } from 'vitest';
import { isHoneypot, isUuid, isValidEmail, normalizeEmail } from './validate.ts';

describe('email checks', () => {
  it('normalizes by trimming and lower-casing', () => {
    expect(normalizeEmail('  Reader@Example.com ')).toBe('reader@example.com');
  });

  it.each(['not-an-email', 'a@b', 'a b@c.de', 'a@b c.de', `${'a'.repeat(315)}@b.com`])(
    'rejects %s',
    (value) => expect(isValidEmail(normalizeEmail(value))).toBe(false),
  );

  it('accepts a normal address', () => {
    expect(isValidEmail(normalizeEmail('Reader@Example.com '))).toBe(true);
  });
});

describe('isHoneypot', () => {
  it('is false when empty or missing, true when filled', () => {
    expect(isHoneypot('')).toBe(false);
    expect(isHoneypot(undefined)).toBe(false);
    expect(isHoneypot('x')).toBe(true);
  });
});

describe('isUuid', () => {
  it('accepts UUIDs only', () => {
    expect(isUuid('6f1c8f4e-2b7a-4d2e-9a51-0c3b5d7e9f10')).toBe(true);
    expect(isUuid('nope')).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});
