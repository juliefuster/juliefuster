import { NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../../../lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    // Tareas mensuales fijas
    const tasks = [
      { id: 5, name: "🧽 Limpieza marquesina" },
      { id: 6, name: "🏭 Limpieza sala de máquinas" },
      { id: 7, name: "💡 Revisión luces de emergencia" },
      { id: 8, name: "⬇️ Limpieza bajante S1" },
      { id: 9, name: "💧 Limpieza pozo S2" },
    ]

    // Buscamos en la tabla monthly_tasks las tareas registradas de ese hotel
    const { data, error } = await supabase
      .from("monthly_tasks")
      .select("*")
      .eq("hotel", hotel)

    if (error) throw error

    // Actualizamos el estado de las tareas según lo encontrado
    const status = tasks.map((task) => {
      const done = data.some((row) => row.name === task.name && row.status === "Completado")
      return { ...task, status: done ? "Completado" : "Pendiente" }
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error fetching monthly tasks status:", error)
    return NextResponse.json({ error: "Failed to fetch monthly tasks status" }, { status: 500 })
  }
}
