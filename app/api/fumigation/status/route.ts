import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")
    const roomsParam = searchParams.get("rooms")

    if (!hotel || !roomsParam) {
      return NextResponse.json({ error: "Falta el parámetro hotel o rooms" }, { status: 400 })
    }

    const rooms = roomsParam.split(",")

    // Consulta a la tabla de fumigación en Supabase
    const { data, error } = await supabase
      .from("fumigation_tasks") // 👈 cambia el nombre si tu tabla se llama diferente
      .select("*")
      .eq("hotel", hotel)
      .in("room", rooms)

    if (error) {
      console.error("❌ Error al obtener datos de Supabase:", error)
      throw error
    }

    // Generar estado de fumigación por habitación
    const status = rooms.map((room) => {
      const task = data?.find((item) => item.room === room)
      return {
        room,
        status: task ? task.status || "Completado" : "Pendiente",
        lastFumigation: task?.last_fumigation || null,
      }
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error fetching fumigation status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
