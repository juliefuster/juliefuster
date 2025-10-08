import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase server client for API routes and server components.
 * Returns null if Supabase is not configured.
 */
export async function createClient() {
  try {
    const cookieStore = await cookies()

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL ||
      process.env.STORAGE_SUPABASE_URL ||
      process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASEE_SUPABASE_URL

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.STORAGE_SUPABASE_ANON_KEY ||
      process.env.SUPABASEE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASEE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("[v0] Supabase credentials not found, using mock data")
      return null
    }

    console.log("[v0] Creating Supabase client with URL:", supabaseUrl?.substring(0, 20) + "...")

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error creating Supabase client:", error)
    return null
  }
}
