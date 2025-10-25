import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// =================================
// 🟦 GET - Obtener fumigaciones
// =================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
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
      console.error("[v1] Error fetching fumigation records:", error)
      throw error
    }

    console.log("[v1] Fumigation records fetched:", data?.length || 0)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v1] Error in GET /api/fumigation:", error)
    return NextResponse.json({ error: "Failed to fetch fumigation records" }, { status: 500 })
  }
}

// =================================
// 🟥 POST - Registrar fumigación
// =================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const hotel = body.hotel
    const dateInput = body.date ?? body.fecha ?? body.fechaFumigacion
    const operatorName = body.operatorName ?? body.operator_name ?? body.responsable
    const rooms = body.rooms ?? ""
    const observations = body.observations ?? body.comentarios ?? ""

    // Validar campos obligatorios
    if (!hotel || !dateInput || !operatorName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (hotel, date, operatorName)" },
        { status: 400 },
      )
    }

    // Formato correcto de fecha local
    const formatDate = (d: string) => {
      const date = new Date(d)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`
    }

    // Convertir habitaciones a array si el campo es JSON
    let roomsValue: any = rooms
    if (typeof rooms === "string") {
      roomsValue = rooms
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean)
    }

    const payload = {
      hotel,
      date: formatDate(dateInput),
      operator_name: operatorName,
      rooms: roomsValue,
      observations,
    }

    console.log("[v1] Creating fumigation record:", payload)

    const { data, error } = await supabase
      .from("fumigation_records")
      .insert([payload])
      .select()
      .single() // ✅ igual que en filtros

    if (error) {
      console.error("[v1] Error creating fumigation record:", error)
      throw error
    }

    console.log("[v1] Fumigation record created successfully")
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v1] Error in POST /api/fumigation:", error)
    return NextResponse.json({ error: "Failed to create fumigation record" }, { status: 500 })
  }
}
