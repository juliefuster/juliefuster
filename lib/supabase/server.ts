import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[v0] ❌ Missing Supabase credentials on server.")
  throw new Error("Supabase configuration missing")
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
