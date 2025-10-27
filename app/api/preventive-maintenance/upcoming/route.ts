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

    const { data: fumigations } = await supabase
      .from("fumigation_records")
      .select("id, date, operator_name, observations, rooms")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    const { data: pumps } = await supabase
      .from("pump_change_records")
      .select("id, date, operator_name, observations, pump_number")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(10)

    const { data: filters } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (fumigations && fumigations.length > 0) {
      const roomLastFumigation = new Map<string, { date: Date; operator: string }>()

      // Build map of last fumigation date for each room
      for (const fum of fumigations) {
        let rooms: string[] = []
        if (Array.isArray(fum.rooms)) {
          rooms = fum.rooms
        } else if (typeof fum.rooms === "string") {
          try {
            rooms = JSON.parse(fum.rooms)
          } catch {
            rooms = fum.rooms
              .split(",")
              .map((r: string) => r.trim())
              .filter(Boolean)
          }
        }

        const fumDate = new Date(fum.date)
        for (const room of rooms) {
          if (!roomLastFumigation.has(room) || fumDate > roomLastFumigation.get(room)!.date) {
            roomLastFumigation.set(room, { date: fumDate, operator: fum.operator_name })
          }
        }
      }

      // Calculate next due date for each room (90 days after last fumigation)
      for (const [room, info] of roomLastFumigation) {
        const nextDue = new Date(info.date)
        nextDue.setDate(nextDue.getDate() + 90)

        // Show if overdue or due within next 90 days
        const daysUntil = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 90) {
          tasks.push({
            type: "Fumigación de chinches",
            date: nextDue.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator_name: info.operator,
            rooms: [room],
            frequency: "Trimestral (cada 90 días)",
          })
        }
      }
    }

    if (filters && filters.length > 0) {
      const roomLastCleaning = new Map<string, { date: Date; operator: string }>()

      // Build map of last cleaning date for each room/filter
      for (const filter of filters) {
        let cleanedRooms: string[] = []
        if (Array.isArray(filter.cleaned_filters)) {
          cleanedRooms = filter.cleaned_filters
        } else if (typeof filter.cleaned_filters === "string") {
          try {
            cleanedRooms = JSON.parse(filter.cleaned_filters)
          } catch {
            cleanedRooms = filter.cleaned_filters
              .split(",")
              .map((r: string) => r.trim())
              .filter(Boolean)
          }
        }

        const cleanDate = new Date(filter.created_at)
        for (const room of cleanedRooms) {
          if (!roomLastCleaning.has(room) || cleanDate > roomLastCleaning.get(room)!.date) {
            roomLastCleaning.set(room, { date: cleanDate, operator: filter.operator_name })
          }
        }
      }

      // Calculate next due date for each room (15 days after last cleaning)
      for (const [room, info] of roomLastCleaning) {
        const nextDue = new Date(info.date)
        nextDue.setDate(nextDue.getDate() + 15)

        // Show if overdue or due within next 90 days
        const daysUntil = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 90) {
          tasks.push({
            type: "Limpieza de filtros de aire",
            date: nextDue.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator_name: info.operator,
            rooms: [room],
            frequency: "Quincenal (cada 15 días)",
          })
        }
      }
    }

    // 💧 Cambio de bombas (cada 7 días)
    if (pumps?.length) {
      for (const p of pumps) {
        const next = new Date(new Date(p.date).getTime() + 7 * 24 * 60 * 60 * 1000)
        const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 90) {
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
    }

    if (showerGrout?.length) {
      for (const sg of showerGrout) {
        const next = new Date(new Date(sg.date).getTime() + 365 * 24 * 60 * 60 * 1000)
        const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 90) {
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
          const nextDate = new Date(mt.next_date)
          const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysUntil <= 90) {
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
    }

    // Sort by date (overdue first, then upcoming)
    tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("[v0] Upcoming tasks calculated:", tasks.length)
    console.log(
      "[v0] Sample tasks:",
      tasks.slice(0, 5).map((t) => ({ type: t.type, date: t.date, rooms: t.rooms?.length || 0 })),
    )

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("[v0] Error fetching upcoming tasks:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
