import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: fumigations, error: fumError } = await supabase
      .from("fumigation_records")
      .select("id, date, next_date, operator_name, rooms")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (fumError) {
      console.error("[v0] Error fetching fumigations:", fumError)
    }

    const { data: filterCleanings, error: filterError } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, next_date, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

    if (filterError) {
      console.error("[v0] Error fetching filter cleanings:", filterError)
    }

    const { data: pumpChanges, error: pumpError } = await supabase
      .from("pump_change_records")
      .select("id, date, next_date, pump_number, operator_name, observations, notes")
      .eq("hotel", hotel)
      .not("next_date", "is", null)
      .order("next_date", { ascending: true })
      .limit(10)

    if (pumpError) {
      console.error("[v0] Error fetching pump changes:", pumpError)
    }

    const { data: monthlyTasks, error: monthlyError } = await supabase
      .from("monthly_task_records")
      .select("id, date, next_date, task_name, operator_name, observations")
      .eq("hotel", hotel)
      .not("next_date", "is", null)
      .order("date", { ascending: false })

    if (monthlyError) {
      console.error("[v0] Error fetching monthly tasks:", monthlyError)
    }

    const { data: showerGrout, error: showerGroutError } = await supabase
      .from("shower_grout_records")
      .select("id, date, type, operator_name, observations")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (showerGroutError) {
      console.error("[v0] Error fetching shower grout:", showerGroutError)
    }

    const upcomingTasks = []

    if (fumigations && fumigations.length > 0) {
      const roomLastFumigation: Record<string, { date: Date; operator: string }> = {}

      fumigations.forEach((fum) => {
        let rooms: string[] = []
        try {
          if (fum.rooms) {
            // Handle jsonb array format (new) or comma-separated string (legacy)
            if (Array.isArray(fum.rooms)) {
              rooms = fum.rooms.filter((r) => r)
            } else if (typeof fum.rooms === "string") {
              rooms = fum.rooms
                .split(",")
                .map((r) => r.trim())
                .filter((r) => r)
            }
          }
        } catch (e) {
          console.error("[v0] Error parsing fumigation rooms:", e, fum.rooms)
        }

        const fumDate = new Date(fum.date)
        rooms.forEach((room) => {
          if (!roomLastFumigation[room] || fumDate > roomLastFumigation[room].date) {
            roomLastFumigation[room] = {
              date: fumDate,
              operator: fum.operator_name,
            }
          }
        })
      })

      console.log("[v0] Fumigation rooms processed:", Object.keys(roomLastFumigation).length)

      // Calculate next fumigation date for each room (90 days after last fumigation)
      Object.entries(roomLastFumigation).forEach(([room, info]) => {
        const nextDate = new Date(info.date.getTime() + 90 * 24 * 60 * 60 * 1000)
        const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Include if overdue OR within next 7 days
        if (diffDays <= 7) {
          upcomingTasks.push({
            type: "Fumigación de chinches",
            date: nextDate.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator: info.operator,
            frequency: "Trimestral (90 días)",
            rooms: [room],
          })
        }
      })
    }

    if (filterCleanings && filterCleanings.length > 0) {
      const filterLastCleaning: Record<string, { date: Date; operator: string }> = {}

      // Find the last cleaning date for each filter/room
      filterCleanings.forEach((filter) => {
        let cleanedFilters: string[] = []
        try {
          if (filter.cleaned_filters) {
            cleanedFilters = Array.isArray(filter.cleaned_filters) ? filter.cleaned_filters : []
          }
        } catch (e) {
          console.error("[v0] Error parsing cleaned filters:", e)
        }

        const cleaningDate = new Date(filter.created_at)
        cleanedFilters.forEach((room) => {
          if (!filterLastCleaning[room] || cleaningDate > filterLastCleaning[room].date) {
            filterLastCleaning[room] = {
              date: cleaningDate,
              operator: filter.operator_name,
            }
          }
        })
      })

      // Calculate next cleaning date for each filter (15 days after last cleaning for biweekly)
      Object.entries(filterLastCleaning).forEach(([room, info]) => {
        const nextDate = new Date(info.date.getTime() + 15 * 24 * 60 * 60 * 1000)
        const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Include if overdue OR within next 7 days
        if (diffDays <= 7) {
          upcomingTasks.push({
            type: "Limpieza filtros de aire",
            date: nextDate.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator: info.operator,
            frequency: "Quincenal (15 días)",
            rooms: [room],
          })
        }
      })
    }

    if (pumpChanges && pumpChanges.length > 0) {
      pumpChanges.forEach((pump) => {
        const pumpDate = new Date(pump.next_date)
        const diffDays = Math.ceil((pumpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays <= 7) {
          upcomingTasks.push({
            type: "Cambio de bombas",
            date: pump.next_date,
            lastCompleted: pump.date,
            operator: pump.operator_name,
            frequency: "Semanal",
            pumpNumber: pump.pump_number,
          })
        }
      })
    }

    if (monthlyTasks && monthlyTasks.length > 0) {
      // Group by task_name and find the most recent record for each task
      const taskLastCompletion: Record<string, { date: Date; nextDate: Date; operator: string }> = {}

      monthlyTasks.forEach((task) => {
        const taskDate = new Date(task.date)
        const nextDate = new Date(task.next_date)

        if (!taskLastCompletion[task.task_name] || taskDate > taskLastCompletion[task.task_name].date) {
          taskLastCompletion[task.task_name] = {
            date: taskDate,
            nextDate: nextDate,
            operator: task.operator_name,
          }
        }
      })

      console.log("[v0] Monthly tasks processed:", Object.keys(taskLastCompletion).length)

      // Add tasks that are due within next 7 days or overdue
      Object.entries(taskLastCompletion).forEach(([taskName, info]) => {
        const diffDays = Math.ceil((info.nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Include if overdue OR within next 7 days
        if (diffDays <= 7) {
          upcomingTasks.push({
            type: `Tarea mensual: ${taskName}`,
            date: info.nextDate.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator: info.operator,
            frequency: "Mensual (30 días)",
            taskName: taskName,
          })
        }
      })
    }

    if (showerGrout && showerGrout.length > 0) {
      // Group by type (Ducha/Pica) and find the most recent record for each
      const typeLastCompletion: Record<string, { date: Date; operator: string }> = {}

      showerGrout.forEach((record) => {
        const recordDate = new Date(record.date)
        if (!typeLastCompletion[record.type] || recordDate > typeLastCompletion[record.type].date) {
          typeLastCompletion[record.type] = {
            date: recordDate,
            operator: record.operator_name,
          }
        }
      })

      // Calculate next date for each type (365 days after last completion)
      Object.entries(typeLastCompletion).forEach(([type, info]) => {
        const nextDate = new Date(info.date.getTime() + 365 * 24 * 60 * 60 * 1000)
        const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Include if overdue OR within next 7 days
        if (diffDays <= 7) {
          upcomingTasks.push({
            type: `Boradas de ${type}`,
            date: nextDate.toISOString().split("T")[0],
            lastCompleted: info.date.toISOString().split("T")[0],
            operator: info.operator,
            frequency: "Anual (365 días)",
            groutType: type,
          })
        }
      })
    }

    // Sort by date
    upcomingTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("[v0] Upcoming tasks fetched:", upcomingTasks.length)
    console.log(
      "[v0] Sample task types:",
      upcomingTasks.slice(0, 5).map((t) => ({ type: t.type, date: t.date, rooms: t.rooms?.length || 0 })),
    )

    return NextResponse.json({ tasks: upcomingTasks })
  } catch (error) {
    console.error("[v0] Error fetching upcoming tasks:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming tasks" }, { status: 500 })
  }
}
