import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials not found in browser")
    throw new Error("Supabase not configured")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
