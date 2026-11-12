/** CORS and JSON helpers shared by the browser-facing functions. */

export type CorsEnv = { SITE_URL: string; ALLOWED_ORIGINS: string[] };

/** CORS headers for `origin`: only the site itself and ALLOWED_ORIGINS are let through. */
export function corsHeaders(origin: string | null, env: CorsEnv): Record<string, string> {
  const allowed = [env.SITE_URL, ...env.ALLOWED_ORIGINS];
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** The response to a CORS preflight, or null when `req` is not one. */
export function preflight(req: Request, env: CorsEnv): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('Origin'), env) });
}

export function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** The visitor's IP: the first entry of x-forwarded-for, which Supabase sets. */
export function clientIp(req: Request): string {
  const first = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || 'unknown';
}
