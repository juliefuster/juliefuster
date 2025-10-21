import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// 📦 FRECUENCIA DE LIMPIEZA: cada 14 días
const CLEANING_INTERVAL_DAYS = 14

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Falta el parámetro 'hotel'" }, { status: 400 })
    }

    const supabase = createClient()

    // 🔹 Obtener todas las limpiezas registradas del hotel
    const { data: records, error } = await supabase
      .from("filter_cleaning_records")
      .select("created_at, cleaned_filters, operator_name, observations")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

    if (error) throw error

    // 🔹 Agrupar la última limpieza por habitación
    const lastByRoom: Record<string, { lastDate: string; operator?: string; observations?: string }> = {}

    for (const rec of records || []) {
      const rooms =
        Array.isArray(rec.cleaned_filters)
          ? rec.cleaned_filters
          : typeof rec.cleaned_filters === "string" && rec.cleaned_filters.startsWith("[")
          ? JSON.parse(rec.cleaned_filters)
          : []

      for (const room of rooms) {
        // Solo guardamos la primera (última en el tiempo)
        if (!lastByRoom[room]) {
          lastByRoom[room] = {
            lastDate: rec.created_at.split("T")[0],
            operator: rec.operator_name,
            observations: rec.observations,
          }
        }
      }
    }

    // 🔹 Calcular estado y próxima limpieza por habitación
    const today = new Date()

    const roomsStatus = Object.entries(lastByRoom).map(([room, info]) => {
      const lastDate = new Date(info.lastDate)
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      const nextDate = new Date(lastDate.getTime() + CLEANING_INTERVAL_DAYS * 24 * 60 * 60 * 1000)

      let status = "upcoming" // ✅ aún no toca
      if (diffDays > CLEANING_INTERVAL_DAYS) status = "overdue" // 🔴 ya se pasó
      else if (diffDays >= CLEANING_INTERVAL_DAYS - 3) status = "soon" // 🟡 se acerca

      return {
        room,
        lastDate: info.lastDate,
        nextDate: nextDate.toISOString().split("T")[0],
        operator: info.operator || "N/A",
        observations: info.observations || "",
        daysSince: diffDays,
        daysRemaining: CLEANING_INTERVAL_DAYS - diffDays,
        status, // upcoming | soon | overdue
      }
    })

    // 🔹 Calcular resumen general
    const summary = {
      total: roomsStatus.length,
      clean: roomsStatus.filter((r) => r.status === "upcoming").length,
      soon: roomsStatus.filter((r) => r.status === "soon").length,
      overdue: roomsStatus.filter((r) => r.status === "overdue").length,
    }

    // 🔹 Devolver respuesta JSON
    return NextResponse.json({ hotel, summary, rooms: roomsStatus })
  } catch (error: any) {
    console.error("Error obteniendo estado de limpieza:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
