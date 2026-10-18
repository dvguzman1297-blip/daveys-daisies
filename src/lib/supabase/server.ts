import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Postgres schema holding the app's tables (see supabase/migrations). */
export const DB_SCHEMA = "daveys_daisies";

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = () =>
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase client using the service-role key. The `daveys_daisies`
 * schema is granted only to service_role, so this key must never reach the
 * browser — the `server-only` import makes that a build error.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
