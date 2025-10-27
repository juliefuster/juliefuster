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

    const { data: showerGrout } = await supabase
      .from("shower_grout_records")
      .select("id, date, operator_name, observations, rooms, type")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(5)

    const { data: monthlyTasks } = await supabase
      .from("monthly_task_records")
      .select("id, date, next_date, operator_name, observations, task_name")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    const tasks: any[] = []

    // 🪳 Fumigación (cada 90 días)
    if (fumigations?.length) {
      for (const f of fumigations) {
        const next = new Date(new Date(f.date).getTime() + 90 * 24 * 60 * 60 * 1000)
        const rooms = Array.isArray(f.rooms)
          ? f.rooms
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
        const cleanedRooms = Array.isArray(fl.cleaned_filters)
          ? fl.cleaned_filters
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

    if (showerGrout?.length) {
      for (const sg of showerGrout) {
        const next = new Date(new Date(sg.date).getTime() + 365 * 24 * 60 * 60 * 1000)
        const rooms = Array.isArray(sg.rooms)
          ? sg.rooms
          : typeof sg.rooms === "string" && sg.rooms.startsWith("[")
            ? JSON.parse(sg.rooms)
            : typeof sg.rooms === "string"
              ? sg.rooms.split(",").map((r: string) => r.trim())
              : []
        tasks.push({
          type: `Boradas de ${sg.type}`,
          date: next.toISOString().split("T")[0],
          lastCompleted: sg.date,
          operator_name: sg.operator_name,
          observations: sg.observations,
          rooms,
          frequency: "Anual (cada 365 días)",
        })
      }
    }

    if (monthlyTasks?.length) {
      const taskGroups = new Map<string, any>()
      for (const mt of monthlyTasks) {
        if (!taskGroups.has(mt.task_name) || new Date(mt.date) > new Date(taskGroups.get(mt.task_name).date)) {
          taskGroups.set(mt.task_name, mt)
        }
      }

      for (const [taskName, mt] of taskGroups) {
        if (mt.next_date) {
          tasks.push({
            type: `Tarea mensual: ${taskName}`,
            date: mt.next_date,
            lastCompleted: mt.date,
            operator_name: mt.operator_name,
            observations: mt.observations,
            rooms: [],
            frequency: "Mensual (cada 30 días)",
          })
        }
      }
    }

    const today = new Date()
    const past = new Date()
    past.setDate(today.getDate() - 30) // Show overdue tasks from last 30 days
    const future = new Date()
    future.setDate(today.getDate() + 90)

    const upcoming = tasks.filter((t) => {
      const d = new Date(t.date)
      return d >= past && d <= future // Include both overdue and upcoming tasks
    })

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ tasks: upcoming })
  } catch (error: any) {
    console.error("[v0] Error fetching upcoming tasks:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
