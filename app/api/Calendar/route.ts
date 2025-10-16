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
    const { data: fumigation, error: fumError } = await supabase
      .from("fumigation_records")
      .select("id, date, operator_name, observations, next_date, rooms")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)

    // 💧 CAMBIO DE BOMBAS: cada 7 días
    const { data: pump, error: pumpError } = await supabase
      .from("pump_change_records")
      .select("id, date, operator_name, observations, pump_number")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)

    // 🌬️ LIMPIEZA DE FILTROS: cada 14 días
    const { data: filters, error: filterError } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })
      .limit(1)

    if (fumError || pumpError || filterError) {
      console.error("Error al obtener datos:", fumError || pumpError || filterError)
    }

    const tasks: any[] = []

    // 🔹 FUMIGACIÓN (cada 90 días)
    if (fumigation?.length) {
      const f = fumigation[0]
      const next = f.next_date
        ? new Date(f.next_date)
        : new Date(new Date(f.date).getTime() + 90 * 24 * 60 * 60 * 1000)

      tasks.push({
        type: "Fumigación de chinches",
        date: next.toISOString().split("T")[0],
        lastCompleted: f.date,
        operator_name: f.operator_name,
        observations: f.observations,
        rooms: f.rooms || [], // 🔸 Habitaciones afectadas
        frequency: "Trimestral (cada 90 días)",
      })
    }

    // 🔹 CAMBIO DE BOMBAS (cada 7 días)
    if (pump?.length) {
      const p = pump[0]
      const next = new Date(new Date(p.date).getTime() + 7 * 24 * 60 * 60 * 1000)

      tasks.push({
        type: `Cambio de bomba ${p.pump_number}`,
        date: next.toISOString().split("T")[0],
        lastCompleted: p.date,
        operator_name: p.operator_name,
        observations: p.observations,
        rooms: [], // 🔸 No aplica
        frequency: "Semanal (cada 7 días)",
      })
    }

    // 🔹 LIMPIEZA DE FILTROS (cada 14 días)
    if (filters?.length) {
      const fl = filters[0]
      const next = new Date(new Date(fl.created_at).getTime() + 14 * 24 * 60 * 60 * 1000)

      tasks.push({
        type: "Limpieza de filtros de aire",
        date: next.toISOString().split("T")[0],
        lastCompleted: fl.created_at.split("T")[0],
        operator_name: fl.operator_name,
        observations: fl.observations,
        rooms: fl.cleaned_filters || [], // 🔸 Habitaciones con filtros limpiados
        frequency: "Quincenal (cada 14 días)",
      })
    }

    // 🔹 Ordenar por fecha más próxima
    tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("[v0] Error fetching calendar tasks:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch calendar tasks", details: error.message },
      { status: 500 },
    )
  }
}
