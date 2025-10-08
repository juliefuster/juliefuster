import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// 📍 GET → obtener registros de limpieza de filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    // Consultar los registros desde Supabase
    let query = supabase
      .from("filter_cleanings") // 👈 cambia si tu tabla se llama distinto
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
    console.error("Error fetching filter cleaning records:", error)
    return NextResponse.json(
      { error: "Error al obtener los registros de limpieza de filtros" },
      { status: 500 }
    )
  }
}

// 📍 POST → crear un nuevo registro de limpieza de filtros
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, cleanedFilters, operatorName, observations } = body

    if (!hotel || !cleanedFilters || !operatorName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("filter_cleanings")
      .insert([
        {
          hotel,
          cleaned_filters: cleanedFilters,
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

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating filter cleaning record:", error)
    return NextResponse.json(
      { error: "Error al crear el registro de limpieza de filtros" },
      { status: 500 }
    )
  }
}
