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

    const { data: fumigations, error: fumError } = await supabase
      .from("fumigation_records")
      .select("id, date, next_date, operator_name, observations")
      .eq("hotel", hotel)
      .order("next_date", { ascending: true })
      .limit(10)

    if (fumError) {
      console.error("[v0] Error fetching fumigations:", fumError)
    }

    const { data: pumpChanges, error: pumpError } = await supabase
      .from("pump_change_records")
      .select("id, change_date, pump_number, operator_name, observations")
      .eq("hotel", hotel)
      .order("change_date", { ascending: false })
      .limit(1)

    if (pumpError) {
      console.error("[v0] Error fetching pump changes:", pumpError)
    }

    const { data: filterCleanings, error: filterError } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })
      .limit(1)

    if (filterError) {
      console.error("[v0] Error fetching filter cleanings:", filterError)
    }

    const upcomingTasks = []

    // Add fumigation tasks (next_date is 3 months after last fumigation)
    if (fumigations && fumigations.length > 0) {
      const lastFumigation = fumigations[0]
      if (lastFumigation.next_date) {
        upcomingTasks.push({
          type: "Fumigación de chinches",
          date: lastFumigation.next_date,
          lastCompleted: lastFumigation.date,
          operator: lastFumigation.operator_name,
          frequency: "Trimestral",
        })
      }
    }

    // Add pump change task (weekly - 7 days after last change)
    if (pumpChanges && pumpChanges.length > 0) {
      const lastPumpChange = pumpChanges[0]
      const nextDate = new Date(lastPumpChange.change_date)
      nextDate.setDate(nextDate.getDate() + 7)
      upcomingTasks.push({
        type: "Cambio de bombas",
        date: nextDate.toISOString().split("T")[0],
        lastCompleted: lastPumpChange.change_date,
        operator: lastPumpChange.operator_name,
        frequency: "Semanal",
      })
    }

    // Add filter cleaning task (biweekly - 14 days after last cleaning)
    if (filterCleanings && filterCleanings.length > 0) {
      const lastFilterCleaning = filterCleanings[0]
      const nextDate = new Date(lastFilterCleaning.created_at)
      nextDate.setDate(nextDate.getDate() + 14)
      upcomingTasks.push({
        type: "Limpieza filtros de aire",
        date: nextDate.toISOString().split("T")[0],
        lastCompleted: lastFilterCleaning.created_at.split("T")[0],
        operator: lastFilterCleaning.operator_name,
        frequency: "Quincenal",
      })
    }

    // Sort by date
    upcomingTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ tasks: upcomingTasks })
  } catch (error) {
    console.error("[v0] Error fetching upcoming tasks:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming tasks" }, { status: 500 })
  }
}
