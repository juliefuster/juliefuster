import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("guia_virtual").select("*").eq("id", params.id).single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error GET /api/guia-virtual/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    console.log("[v0] Updating guide with body:", body)

    // Verificar guía existente
    const { data: current, error: fetchError } = await supabase
      .from("guia_virtual")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("[v0] Error fetching current guide:", fetchError)
      throw fetchError
    }

    console.log("[v0] Current guide data:", current)

    const { data, error } = await supabase
      .from("guia_virtual")
      .update({
        titulo: body.titulo,
        descripcion: body.descripcion,
        departamento: body.departamento,
        hotel: body.hotel,
        modificado_por: body.modificado_por,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating guide:", error.message)
      throw error
    }

    console.log("[v0] Guide updated successfully:", data)

    // Guardar en historial
    const { error: historialError } = await supabase.from("guia_historial").insert({
      guia_id: params.id,
      modificado_por: body.modificado_por || "Sistema",
      cambio: "Guía actualizada",
      contenido_anterior_titulo: current?.titulo,
      contenido_anterior_descripcion: current?.descripcion,
      contenido_anterior_departamento: current?.departamento,
      contenido_anterior_hotel: current?.hotel,
    })

    if (historialError) {
      console.error("[v0] Error saving history:", historialError)
    } else {
      console.log("[v0] History saved successfully")
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Error PATCH /api/guia-virtual/[id]:", error.message || error)
    return NextResponse.json({ error: error.message || "Failed to update guide" }, { status: 500 })
  }
}
