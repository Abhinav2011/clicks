import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Public client (browser-safe, uses anon key) ──────────
// Lazy-initialized to avoid crashing at build time when env vars are missing
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!url || !key) {
      throw new Error("Supabase is not configured");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ─── Server-only admin client (uses service-role key) ─────
// NEVER import this in client components
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key);
}

// ─── Helpers ──────────────────────────────────────────────
/** Whether Supabase credentials are configured */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key && url !== "https://YOUR_PROJECT.supabase.co");
}
