// The anon key is safe to expose because Row Level Security decides what the
// browser may read or write. Never import a service-role key here.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// New projects call this the publishable key; older ones call it the anon key.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The library shows a setup error when the keys are absent.
export const isCloudLibraryEnabled = Boolean(supabaseUrl && supabaseKey);

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;

  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
