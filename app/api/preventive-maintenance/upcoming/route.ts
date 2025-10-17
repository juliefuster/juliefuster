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
      .not("next_date", "is", null)
      .order("next_date", { ascending: true })
      .limit(10)

    if (fumError) {
      console.error("[v0] Error fetching fumigations:", fumError)
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

    const { data: filterCleanings, error: filterError } = await supabase
      .from("filter_cleaning_records")
      .select("id, created_at, next_date, operator_name, observations, cleaned_filters")
      .eq("hotel", hotel)
      .not("next_date", "is", null)
      .order("next_date", { ascending: true })
      .limit(10)

    if (filterError) {
      console.error("[v0] Error fetching filter cleanings:", filterError)
    }

    const upcomingTasks = []

    if (fumigations && fumigations.length > 0) {
      fumigations.forEach((fum) => {
        let rooms = []
        try {
          if (fum.observations && typeof fum.observations === "string") {
            // Extract rooms from format: "Habitaciones fumigadas: 101, 102, 103"
            const match = fum.observations.match(/Habitaciones fumigadas:\s*([0-9,\s]+)/)
            if (match && match[1]) {
              rooms = match[1]
                .split(",")
                .map((r) => r.trim())
                .filter((r) => r)
            }
          }
        } catch (e) {
          console.error("[v0] Error parsing fumigation observations:", e)
        }

        upcomingTasks.push({
          type: "Fumigación de chinches",
          date: fum.next_date,
          lastCompleted: fum.date,
          operator: fum.operator_name,
          frequency: "Trimestral",
          rooms: rooms,
        })
      })
    }

    if (pumpChanges && pumpChanges.length > 0) {
      pumpChanges.forEach((pump) => {
        upcomingTasks.push({
          type: "Cambio de bombas",
          date: pump.next_date,
          lastCompleted: pump.date,
          operator: pump.operator_name,
          frequency: "Semanal",
          pumpNumber: pump.pump_number,
        })
      })
    }

    if (filterCleanings && filterCleanings.length > 0) {
      filterCleanings.forEach((filter) => {
        let cleanedFilters = []
        try {
          if (filter.cleaned_filters) {
            cleanedFilters = Array.isArray(filter.cleaned_filters) ? filter.cleaned_filters : []
          }
        } catch (e) {
          console.error("[v0] Error parsing cleaned filters:", e)
        }

        upcomingTasks.push({
          type: "Limpieza filtros de aire",
          date: filter.next_date,
          lastCompleted: filter.created_at?.split("T")[0],
          operator: filter.operator_name,
          frequency: "Quincenal",
          rooms: cleanedFilters,
        })
      })
    }

    // Sort by date
    upcomingTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("[v0] Upcoming tasks fetched:", upcomingTasks.length)
    return NextResponse.json({ tasks: upcomingTasks })
  } catch (error) {
    console.error("[v0] Error fetching upcoming tasks:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming tasks" }, { status: 500 })
  }
}
