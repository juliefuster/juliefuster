import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status
    }

    if (body.resolutionData) {
      updateData.resolved_at = body.resolutionData.resolvedAt
      updateData.resolved_by = body.resolutionData.responsible
      updateData.resolution_notes = body.resolutionData.notes
    }

    if (body.title) updateData.title = body.title
    if (body.description) updateData.description = body.description
    if (body.location) updateData.location = body.location
    if (body.category) updateData.category = body.category
    if (body.priority) updateData.priority = body.priority
    if (body.reported_by) updateData.reported_by = body.reported_by

    const { error } = await supabase.from("maintenance_tasks").update(updateData).eq("id", id)

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("PATCH error:", error)
    return NextResponse.json({ error: "Error al actualizar la avería", details: error.message }, { status: 500 })
  }
}
