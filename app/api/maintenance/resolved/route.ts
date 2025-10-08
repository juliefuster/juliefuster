import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    // 🔹 Consulta las averías resueltas en Supabase
    let query = supabase
      .from("maintenance_tasks") // 👈 cambia si tu tabla se llama distinto
      .select("*")
      .eq("status", "Resuelto") // solo las resueltas
      .order("resolved_at", { ascending: false })

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Error al obtener datos de Supabase:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching resolved issues:", error)
    return NextResponse.json(
      { error: "Error al cargar las averías resueltas" },
      { status: 500 }
    )
  }
}
