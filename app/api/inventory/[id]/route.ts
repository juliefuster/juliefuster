import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventario")
      .update({
        hotel: body.hotel,
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
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0])
  } catch (error) {
    console.error("[v0] Error updating inventory item:", error)
    return NextResponse.json({ error: "Error updating inventory item" }, { status: 500 })
  }
}
