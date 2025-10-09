import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Missing hotel parameter" }, { status: 400 })
    }

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("hotel", hotel)
      .eq("status", "resuelto")
      .order("resolved_at", { ascending: false })

    if (error) {
      console.error("Error al obtener averías resueltas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (data || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      location: task.location,
      priority: task.priority,
      status: task.status,
      reportedBy: task.reported_by || "Sin asignar",
      createdAt: task.created_at,
      resolvedAt: task.resolved_at || null,
      resolvedBy: task.resolved_by || null,
      resolutionNotes: task.resolution_notes || null,
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (err: any) {
    console.error("Error fetching resolved issues:", err.message || err)
    return NextResponse.json({ error: "Failed to fetch resolved issues", details: err.message }, { status: 500 })
  }
}
