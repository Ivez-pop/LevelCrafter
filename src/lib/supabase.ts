import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Lazily creates a singleton Supabase client.
 * Centralizing this prevents duplicate auth listeners and keeps environment
 * validation in one place.
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

  return supabaseClient;
}
