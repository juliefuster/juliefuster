import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 🪳 FUMIGACIÓN: cada 90 días
    const { data: fumigations } = await supabase
      .from("fumigation_records")
      .select("id, date, operator_name, observations, rooms")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(10)

    // 💧 CAMBIO DE BOMBAS: cada 7 días
    const { data: pumps } = await supabase
      .from("pump_change_records")
      .select("id, date, operator_name, observations, pump_number")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(10)

    // 🌬️ LIMPIEZA DE FILTROS: cada 14 días
    const { data: filters } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })
      .limit(20)

    const tasks: any[] = []

    // 🪳 Fumigación (cada 90 días)
    if (fumigations?.length) {
      for (const f of fumigations) {
        const next = new Date(new Date(f.date).getTime() + 90 * 24 * 60 * 60 * 1000)
        const rooms =
          Array.isArray(f.rooms) ? f.rooms
          : typeof f.rooms === "string" && f.rooms.startsWith("[")
          ? JSON.parse(f.rooms)
          : []
        tasks.push({
          type: "Fumigación de chinches",
          date: next.toISOString().split("T")[0],
          lastCompleted: f.date,
          operator_name: f.operator_name,
          observations: f.observations,
          rooms,
          frequency: "Trimestral (cada 90 días)",
        })
      }
    }

    // 💧 Cambio de bombas (cada 7 días)
    if (pumps?.length) {
      for (const p of pumps) {
        const next = new Date(new Date(p.date).getTime() + 7 * 24 * 60 * 60 * 1000)
        tasks.push({
          type: `Cambio de bomba ${p.pump_number}`,
          date: next.toISOString().split("T")[0],
          lastCompleted: p.date,
          operator_name: p.operator_name,
          observations: p.observations,
          rooms: [],
          frequency: "Semanal (cada 7 días)",
        })
      }
    }

    // 🌬️ Limpieza filtros (cada 14 días)
    if (filters?.length) {
      for (const fl of filters) {
        const next = new Date(new Date(fl.created_at).getTime() + 14 * 24 * 60 * 60 * 1000)
        const cleanedRooms =
          Array.isArray(fl.cleaned_filters) ? fl.cleaned_filters
          : typeof fl.cleaned_filters === "string" && fl.cleaned_filters.startsWith("[")
          ? JSON.parse(fl.cleaned_filters)
          : []
        tasks.push({
          type: "Limpieza de filtros de aire",
          date: next.toISOString().split("T")[0],
          lastCompleted: fl.created_at.split("T")[0],
          operator_name: fl.operator_name,
          observations: fl.observations,
          rooms: cleanedRooms,
          frequency: "Quincenal (cada 14 días)",
        })
      }
    }

    // 🔹 Solo mantener los próximos 90 días (para no llenar el calendario)
    const today = new Date()
    const future = new Date()
    future.setDate(today.getDate() + 90)

    const upcoming = tasks.filter((t) => {
      const d = new Date(t.date)
      return d >= today && d <= future
    })

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ tasks: upcoming })
  } catch (error: any) {
    console.error("[calendar] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
