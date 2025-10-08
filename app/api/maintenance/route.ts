import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// 📍 POST → Crear nueva avería
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, location, priority, reportedBy, hotel } = body

    // Validación básica
    if (!title || !category || !hotel) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: título, categoría o hotel" },
        { status: 400 }
      )
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from("maintenance_tasks") // 👈 cambia si tu tabla se llama distinto
      .insert([
        {
          title,
          description: description || null,
          category,
          location,
          priority,
          reported_by: reportedBy || null,
          hotel,
          status: "Pendiente",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error al crear avería en Supabase:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    })
  } catch (error) {
    console.error("Error creating maintenance issue:", error)
    return NextResponse.json(
      { error: "Error al crear la avería" },
      { status: 500 }
    )
  }
}

// 📍 GET → Obtener todas las averías
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    let query = supabase.from("maintenance_tasks").select("*").order("created_at", { ascending: false })

    if (hotel) {
      query = query.eq("hotel", hotel)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Error al obtener averías desde Supabase:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching maintenance issues:", error)
    return NextResponse.json(
      { error: "Error al cargar las averías" },
      { status: 500 }
    )
  }
}
