import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json(
        { error: "Falta el parámetro hotel" },
        { status: 400 }
      )
    }

    // 🧾 Lista fija de tareas mensuales
    const tasks = [
      { id: 5, name: "🧽 Limpieza marquesina" },
      { id: 6, name: "🏭 Limpieza sala de máquinas" },
      { id: 7, name: "💡 Revisión luces de emergencia" },
      { id: 8, name: "⬇️ Limpieza bajante S1" },
      { id: 9, name: "💧 Limpieza pozo S2" },
    ]

    // 🔹 Consultamos las tareas registradas de ese hotel
    const { data, error } = await supabase
      .from("monthly_tasks") // asegúrate de tener esta tabla creada
      .select("name, status")
      .eq("hotel", hotel)

    if (error) {
      console.error("❌ Error al consultar Supabase:", error)
      throw error
    }

    // 🔹 Determinamos el estado actual de cada tarea
    const status = tasks.map((task) => {
      const match = data?.find((row) => row.name === task.name)
      return {
        ...task,
        status: match?.status === "Completado" ? "Completado" : "Pendiente",
      }
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error fetching monthly tasks status:", error)
    return NextResponse.json(
      { error: "Error al obtener el estado de las tareas mensuales" },
      { status: 500 }
    )
  }
}
