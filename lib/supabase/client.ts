import { createBrowserClient } from "@supabase/ssr"

/**
 * Crea un cliente de Supabase para el navegador.
 * Se usa en componentes o hooks del lado del cliente (client components).
 */
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
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Instancia por defecto del cliente del navegador.
 * Permite hacer import { supabase } from "@/lib/supabase/client"
 */
const supabase = createClient()
export { supabase }
