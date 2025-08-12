import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  // Lovable Supabase native integration: when connected, these globals are injected.
  const url = (window as any).__SUPABASE_URL__ as string | undefined;
  const anon = (window as any).__SUPABASE_ANON_KEY__ as string | undefined;

  if (url && anon) {
    client = createClient(url, anon);
    return client;
  }

  // Not connected yet
  return null;
}
