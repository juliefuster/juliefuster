import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("fumigation_records")
      .select("*")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (error) {
      console.error("❌ Error fetching fumigation records:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error("💥 Error in GET /api/fumigation:", err?.message || err)
    return NextResponse.json(
      { error: "Failed to fetch fumigation records", details: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const hotel = body.hotel
    const dateInput = body.date ?? body.fecha ?? body.fechaFumigacion
    const operatorName = body.operatorName ?? body.operator_name ?? body.responsable
    const rooms = body.rooms ?? "" // Rooms as comma-separated string
    const observations = body.observations ?? body.comentarios ?? ""

    // Validar campos obligatorios
    if (!hotel || !dateInput || !operatorName) {
      return NextResponse.json({ error: "Faltan campos obligatorios (hotel, date, operatorName)" }, { status: 400 })
    }

    // Función para convertir fecha a formato YYYY-MM-DD
    const formatDate = (d: string) => new Date(d).toISOString().split("T")[0]

    const payload = {
      hotel,
      date: formatDate(dateInput),
      operator_name: operatorName,
      rooms, // Store rooms in separate column
      observations,
    }

    console.log("[v0] Fumigation payload:", payload)

    const supabase = createClient()

    // Insertar registro en la tabla
    const { error } = await supabase.from("fumigation_records").insert([payload])

    if (error) {
      console.error("❌ Error al insertar en fumigation_records:", error.message)
      throw error
    }

    console.log("✅ Registro de fumigación guardado correctamente")
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("💥 Error general al guardar fumigación:", err?.message || err)
    return NextResponse.json(
      {
        error: "No se pudo guardar la fumigación",
        details: err?.message ?? String(err),
      },
      { status: 500 },
    )
  }
}
