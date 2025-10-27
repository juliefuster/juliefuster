import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, type, rooms, date, operator_name, observations } = body

    // Validación de campos requeridos
    if (!hotel || !type || !date || !operator_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validar rooms: puede ser string o array
    let roomsToStore: string | null = null
    if (Array.isArray(rooms)) {
      roomsToStore = rooms.join(", ")
    } else if (typeof rooms === "string" && rooms.trim() !== "") {
      roomsToStore = rooms.trim()
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("shower_grout_records")
      .insert([
        {
          hotel,
          type,
          rooms: roomsToStore,
          date,
          operator_name,
          observations: observations || null,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("shower_grout_records")
      .select("id, hotel, type, rooms, date, operator_name, observations")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
