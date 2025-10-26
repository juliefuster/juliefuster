import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    // Get current inventory item
    const { data: item, error: fetchError } = await supabase
      .from("inventario")
      .select("cantidad_actual")
      .eq("id", body.inventario_id)
      .single()

    if (fetchError) throw fetchError

    // Calculate new quantity
    const newQuantity =
      body.tipo === "entrada" ? item.cantidad_actual + body.cantidad : item.cantidad_actual - body.cantidad

    // Update inventory
    const updateData: any = {
      cantidad_actual: newQuantity,
      actualizado_en: new Date().toISOString(),
    }

    if (body.tipo === "entrada") {
      updateData.ultima_entrada = new Date().toISOString()
    } else {
      updateData.ultima_salida = new Date().toISOString()
    }

    const { error: updateError } = await supabase.from("inventario").update(updateData).eq("id", body.inventario_id)

    if (updateError) throw updateError

    // Record movement
    const { error: movementError } = await supabase.from("movimientos_stock").insert([
      {
        inventario_id: body.inventario_id,
        tipo: body.tipo,
        cantidad: body.cantidad,
        usuario: body.usuario,
        comentario: body.comentario,
      },
    ])

    if (movementError) throw movementError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error recording movement:", error)
    return NextResponse.json({ error: "Error recording movement" }, { status: 500 })
  }
}
