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

    console.log("[v0] Fumigation records fetched:", data?.length || 0)
    return NextResponse.json(data || [])
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
