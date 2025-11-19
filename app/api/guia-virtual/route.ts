import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const hotel = searchParams.get("hotel")
    const departamento = searchParams.get("departamento")

    let query = supabase.from("guia_virtual").select("*")

    // Apply search filter
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`)
    }

    // Apply hotel filter
    if (hotel && hotel !== "Todos") {
      query = query.or(`hotel.eq.${hotel},hotel.eq.Ambos`)
    }

    // Apply departamento filter
    if (departamento && departamento !== "Todos") {
      query = query.eq("departamento", departamento)
    }

    const { data, error } = await query.order("titulo")

    if (error) {
      console.error("[v0] Error fetching guides:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error in GET /api/guia-virtual:", error)
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("guia_virtual")
      .insert({
        titulo: body.titulo,
        descripcion: body.descripcion,
        departamento: body.departamento,
        hotel: body.hotel,
        modificado_por: body.modificado_por,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating guide:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log history
    await supabase.from("guia_historial").insert({
      guia_id: data.id,
      modificado_por: body.modificado_por,
      cambio: "Guía creada",
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in POST /api/guia-virtual:", error)
    return NextResponse.json({ error: "Failed to create guide" }, { status: 500 })
  }
}
