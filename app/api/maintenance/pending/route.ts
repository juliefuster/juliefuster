import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    let query = supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("status", "pendiente")
      .order("created_at", { ascending: false })

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (err: any) {
    console.error("Server error:", err.message || err)
    return NextResponse.json({ error: "Error al cargar las averías pendientes", details: err.message }, { status: 500 })
  }
}
