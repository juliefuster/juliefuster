import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// 📍 GET → obtener registros de fumigación
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    let query = supabase.from("fumigation_records").select("*").order("date", { ascending: false })

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching fumigation records:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// 📍 POST → crear nuevo registro de fumigación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, fumigatedRooms, operatorName, observations } = body

    if (!hotel || !fumigatedRooms || !operatorName) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const { data, error } = await supabase.from("fumigation_records").insert([
      {
        hotel,
        fumigated_rooms: fumigatedRooms, // 👈 usa el nombre de columna real en Supabase
        operator_name: operatorName,
        observations: observations || null,
        date: new Date().toISOString(),
      },
    ]).select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("[v0] Error creating fumigation record:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
