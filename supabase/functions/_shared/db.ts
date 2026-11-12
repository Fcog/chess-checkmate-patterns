// Deno only (excluded from the site's type check): the service-role Supabase client.
import { createClient } from 'npm:@supabase/supabase-js@2';

export function serviceClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
