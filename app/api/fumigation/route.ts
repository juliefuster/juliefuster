import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("fumigation_records")
      .select("*")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching fumigation records:", error)
      throw error
    }

    // Expand records into individual room entries with per-room status
    const roomEntries: any[] = []

    // Process each record
    for (const record of data || []) {
      // Parse rooms from the record
      let rooms: string[] = []
      if (Array.isArray(record.rooms)) {
        rooms = record.rooms
      } else if (typeof record.rooms === "string") {
        try {
          // Try parsing as JSON first
          rooms = JSON.parse(record.rooms)
        } catch {
          // If not JSON, split by comma
          rooms = record.rooms
            .replace(/[[\]"]/g, "")
            .split(",")
            .map((r: string) => r.trim())
            .filter(Boolean)
        }
      }

      // For each room in this record, calculate its individual status
      for (const room of rooms) {
        // Find the previous fumigation of this specific room
        let previousDate: Date | null = null

        // Look through all records to find the previous fumigation of this room
        for (const otherRecord of data || []) {
          // Skip if it's the same record or a later date
          if (otherRecord.id === record.id || new Date(otherRecord.date) >= new Date(record.date)) {
            continue
          }

          // Check if this record contains the same room
          let otherRooms: string[] = []
          if (Array.isArray(otherRecord.rooms)) {
            otherRooms = otherRecord.rooms
          } else if (typeof otherRecord.rooms === "string") {
            try {
              otherRooms = JSON.parse(otherRecord.rooms)
            } catch {
              otherRooms = otherRecord.rooms
                .replace(/[[\]"]/g, "")
                .split(",")
                .map((r: string) => r.trim())
                .filter(Boolean)
            }
          }

          // If this record contains the same room, check if it's the most recent previous one
          if (otherRooms.includes(room)) {
            const otherDate = new Date(otherRecord.date)
            if (!previousDate || otherDate > previousDate) {
              previousDate = otherDate
            }
          }
        }

        // Calculate days difference and status for this room
        let diferencia_dias: number | null = null
        let estado: "adelantada" | "correcta" | null = null

        if (previousDate) {
          const currentDate = new Date(record.date)
          const diffTime = currentDate.getTime() - previousDate.getTime()
          diferencia_dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          estado = diferencia_dias < 90 ? "adelantada" : "correcta"
        }

        // Add this room entry
        roomEntries.push({
          id: record.id,
          hotel: record.hotel,
          date: record.date,
          operator_name: record.operator_name,
          room: room, // Single room
          observations: record.observations,
          next_date: record.next_date,
          diferencia_dias,
          estado,
        })
      }
    }

    console.log("[v0] Fumigation room entries created:", roomEntries.length)
    return NextResponse.json(roomEntries)
  } catch (error) {
    console.error("[v0] Error in GET /api/fumigation:", error)
    return NextResponse.json({ error: "Failed to fetch fumigation records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { hotel, date, operator_name, rooms, observations } = body

    console.log("[v0] Fumigation request body:", { hotel, date, operator_name, rooms, observations })

    if (!hotel || !date || !operator_name) {
      return NextResponse.json({ error: "Missing required fields: hotel, date, operator_name" }, { status: 400 })
    }

    let roomsArray: string[]
    if (Array.isArray(rooms)) {
      roomsArray = rooms
    } else if (typeof rooms === "string") {
      // Split comma-separated string into array
      roomsArray = rooms
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    } else {
      roomsArray = []
    }

    console.log("[v0] Creating fumigation record:", {
      hotel,
      date,
      operator_name,
      rooms: roomsArray,
      observations,
    })

    const { data, error } = await supabase
      .from("fumigation_records")
      .insert([
        {
          hotel,
          date,
          operator_name,
          rooms: roomsArray, // Store as JSON array
          observations: observations || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating fumigation record:", error)
      throw error
    }

    console.log("[v0] Fumigation record created successfully:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/fumigation:", error)
    return NextResponse.json({ error: "Failed to create fumigation record" }, { status: 500 })
  }
}
