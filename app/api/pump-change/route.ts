import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// 📍 GET → obtener registros de cambios de bomba
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    // Consultamos los registros de cambios de bomba desde Supabase
    let query = supabase
      .from("pump_changes") // 👈 cambia si tu tabla tiene otro nombre
      .select("*")
      .order("date", { ascending: false })

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Error al obtener registros de Supabase:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching pump change records:", error)
    return NextResponse.json(
      { error: "Error al obtener los registros de cambios de bomba" },
      { status: 500 }
    )
  }
}

// 📍 POST → crear un nuevo registro de cambio de bomba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, pumpNumber, operatorName, observations } = body

    if (!hotel || !pumpNumber || !operatorName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: hotel, bomba u operador" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("pump_changes")
      .insert([
        {
          hotel,
          pump_number: pumpNumber,
          operator_name: operatorName,
          observations: observations || null,
          date: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error al crear registro en Supabase:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating pump change record:", error)
    return NextResponse.json(
      { error: "Error al crear el registro de cambio de bomba" },
      { status: 500 }
    )
  }
}
