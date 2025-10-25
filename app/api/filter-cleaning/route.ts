import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const { data: allRecords, error } = await supabase
      .from("filter_cleaning_records")
      .select("*")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching filter cleaning records:", error)
      throw error
    }

    const roomEntries: any[] = []
    const roomLastCleaningMap: Record<string, Date> = {}

    // Sort records by date ascending to process chronologically
    const sortedRecords = [...(allRecords || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    sortedRecords.forEach((record) => {
      const cleanedFilters = Array.isArray(record.cleaned_filters) ? record.cleaned_filters : []
      const recordDate = new Date(record.created_at)

      cleanedFilters.forEach((room: string) => {
        const previousCleaningDate = roomLastCleaningMap[room]
        let diferencia_dias: number | null = null
        let estado: "adelantada" | "correcta" = "correcta"

        if (previousCleaningDate) {
          const diffMs = recordDate.getTime() - previousCleaningDate.getTime()
          diferencia_dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

          // Filter cleaning cycle is 15 days (biweekly)
          if (diferencia_dias < 15) {
            estado = "adelantada"
          }
        }

        // Calculate next_date (15 days after current cleaning)
        const nextDate = new Date(recordDate)
        nextDate.setDate(nextDate.getDate() + 15)

        roomEntries.push({
          id: `${record.id}-${room}`,
          hotel: record.hotel,
          room: room,
          operator_name: record.operator_name,
          observations: record.observations,
          created_at: record.created_at,
          next_date: nextDate.toISOString().split("T")[0],
          diferencia_dias,
          estado,
        })

        // Update the last cleaning date for this room
        roomLastCleaningMap[room] = recordDate
      })
    })

    // Sort by date descending for display
    roomEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log("[v0] Filter cleaning room entries created:", roomEntries.length)
    return NextResponse.json(roomEntries)
  } catch (error) {
    console.error("[v0] Error in GET /api/filter-cleaning:", error)
    return NextResponse.json({ error: "Failed to fetch filter cleaning records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { hotel, cleaned_filters, operator_name, observations } = body

    if (!hotel || !cleaned_filters || !operator_name) {
      return NextResponse.json(
        { error: "Missing required fields: hotel, cleaned_filters, operator_name" },
        { status: 400 },
      )
    }

    console.log("[v0] Creating filter cleaning record:", { hotel, cleaned_filters, operator_name })

    const { data, error } = await supabase
      .from("filter_cleaning_records")
      .insert([
        {
          hotel,
          cleaned_filters: cleaned_filters,
          operator_name: operator_name,
          observations: observations || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating filter cleaning record:", error)
      throw error
    }

    console.log("[v0] Filter cleaning record created successfully")
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/filter-cleaning:", error)
    return NextResponse.json({ error: "Failed to create filter cleaning record" }, { status: 500 })
  }
}
