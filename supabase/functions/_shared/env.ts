/** Secrets and settings of the newsletter functions (contracts/http-api.md, Secrets). */
export type Env = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  /** No trailing slash. */
  SITE_URL: string;
  ALLOWED_ORIGINS: string[];
  IP_HASH_SECRET: string;
  CRON_SECRET: string;
  RESEND_WEBHOOK_SECRET: string;
  SEND_TIME_BUDGET_MS: number;
  /** Resend's API base; only overridden for local testing. */
  RESEND_API_URL: string;
  /** No trailing slash. */
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Key = keyof Env;

/**
 * Reads the settings a function needs. `get` is `Deno.env.get` in the functions and a plain
 * lookup in tests. Throws, naming the variable, if a required one is missing.
 */
export function readEnv(get: (key: string) => string | undefined, required: Key[]): Env {
  for (const key of required) {
    if (key === 'ALLOWED_ORIGINS' || key === 'SEND_TIME_BUDGET_MS') continue;
    if (!get(key)) throw new Error(`Missing environment variable ${key}`);
  }
  const trim = (s: string | undefined) => (s ?? '').replace(/\/+$/, '');
  return {
    RESEND_API_KEY: get('RESEND_API_KEY') ?? '',
    FROM_EMAIL: get('FROM_EMAIL') ?? '',
    SITE_URL: trim(get('SITE_URL')),
    ALLOWED_ORIGINS: (get('ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    IP_HASH_SECRET: get('IP_HASH_SECRET') ?? '',
    CRON_SECRET: get('CRON_SECRET') ?? '',
    RESEND_WEBHOOK_SECRET: get('RESEND_WEBHOOK_SECRET') ?? '',
    SEND_TIME_BUDGET_MS: Number(get('SEND_TIME_BUDGET_MS')) || 120_000,
    RESEND_API_URL: trim(get('RESEND_API_URL')) || 'https://api.resend.com',
    SUPABASE_URL: trim(get('SUPABASE_URL')),
    SUPABASE_SERVICE_ROLE_KEY: get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  };
}
