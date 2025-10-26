import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("inventario").select("*").order("nombre", { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error fetching inventory:", error)
    return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventario")
      .insert([
        {
          nombre: body.nombre,
          departamento: body.departamento,
          cantidad_actual: body.cantidad_actual,
          unidad: body.unidad,
          ubicacion: body.ubicacion,
          proveedor: body.proveedor,
          enlace_compra: body.enlace_compra,
          email_pedido: body.email_pedido,
          frecuencia_pedido: body.frecuencia_pedido,
          instrucciones_pedido: body.instrucciones_pedido,
          stock_minimo: body.stock_minimo,
          responsable: body.responsable,
          notas: body.notas,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0])
  } catch (error) {
    console.error("[v0] Error creating inventory item:", error)
    return NextResponse.json({ error: "Error creating inventory item" }, { status: 500 })
  }
}
