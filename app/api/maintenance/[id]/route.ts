import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log("[v0] PATCH /api/maintenance/[id] called")

  try {
    const { id } = params
    const body = await request.json()
    const { status, resolutionData } = body

    console.log("[v0] Updating issue:", id, "to status:", status)

    // 🔹 Actualizamos el registro en la tabla 'maintenance_tasks' (puedes cambiar el nombre)
    const { data, error } = await supabase
      .from("maintenance_tasks") // 👈 cambia si tu tabla tiene otro nombre
      .update({
        status,
        resolution_data: resolutionData ?? null, // campo opcional con info adicional
        resolved_at: status === "Resuelto" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("❌ Error al actualizar en Supabase:", error)
      throw error
    }

    console.log("[v0] Issue updated successfully")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating issue:", error)
    return NextResponse.json(
      { error: "Error al actualizar la avería" },
      { status: 500 }
    )
  }
}
