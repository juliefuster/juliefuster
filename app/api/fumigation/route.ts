import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Fumigation POST request body:", body)

    const { hotel, date, operator_name, observations, next_date } = body

    if (!hotel || !date || !operator_name) {
      console.error("[v0] Missing required fields:", { hotel, date, operator_name })
      return NextResponse.json({ error: "Faltan datos obligatorios (hotel, date o operator_name)" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("fumigation_records")
      .insert([
        {
          hotel,
          date,
          operator_name,
          observations: observations || "",
          next_date: next_date || null,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      throw error
    }

    console.log("[v0] Fumigation record saved successfully:", data)

    return NextResponse.json({ message: "Registro guardado correctamente", data }, { status: 201 })
  } catch (err: any) {
    console.error("[v0] Error al guardar fumigación:", err.message)
    return NextResponse.json({ error: "No se pudo guardar la fumigación", details: err.message }, { status: 500 })
  }
}
