import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("guia_historial")
      .select("id, guia_id, modificado_por, cambio, created_at")
      .eq("guia_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error in GET /api/guia-virtual/[id]/historial:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
