import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hotel = searchParams.get("hotel")
  const equipmentType = searchParams.get("equipmentType")

  if (!hotel) {
    return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
  }

  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from("repair_history")
      .select("*")
      .eq("hotel", hotel)
      .order("repair_date", { ascending: false })

    if (equipmentType) {
      query = query.eq("equipment_type", equipmentType)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching repair history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ records: data || [] })
  } catch (error: any) {
    console.error("[v0] Repair history API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      hotel,
      equipmentType,
      repairDate,
      technicianName,
      workDescription,
      partsReplaced,
      cost,
      hotelPersonPresent,
      observations,
    } = body

    if (!hotel || !equipmentType || !technicianName) {
      return NextResponse.json(
        { error: "Hotel, equipment type, and technician name are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("repair_history")
      .insert([
        {
          hotel,
          equipment_type: equipmentType,
          repair_date: repairDate || new Date().toISOString().split("T")[0],
          technician_name: technicianName,
          work_description: workDescription || null,
          parts_replaced: partsReplaced || [],
          cost: cost || null,
          hotel_person_present: hotelPersonPresent || null,
          observations: observations || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating repair record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ record: data }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Repair history POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
