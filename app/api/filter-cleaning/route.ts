import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("filter_cleaning_records")
      .select("*")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching filter cleaning records:", error)
      throw error
    }

    console.log("[v0] Filter cleaning records fetched:", data?.length || 0)
    return NextResponse.json(data || [])
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
