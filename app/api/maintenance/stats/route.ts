import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: Request) {
  console.log("[v0] Stats API called")

  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")
    console.log("[v0] Hotel parameter:", hotel)

    // 🔹 Consulta todas las averías del hotel (si hay filtro)
    let query = supabase.from("maintenance_tasks").select("*")

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Error al obtener datos de Supabase:", error)
      throw error
    }

    // 🔹 Calculamos estadísticas
    const total = data.length
    const pending = data.filter((i) => i.status === "Pendiente").length
    const resolved = data.filter((i) => i.status === "Resuelto").length

    const stats = { total, pending, resolved }

    console.log("[v0] Stats retrieved:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    )
  }
}
