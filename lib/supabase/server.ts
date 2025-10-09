import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] ⚠️ Supabase credentials not found, returning null client")
    return null
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export const createClient = createServerClient
