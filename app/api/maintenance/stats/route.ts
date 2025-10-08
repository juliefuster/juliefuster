import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(request: Request) {
  console.log("[SERVER] [API] /maintenance/stats called")

  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Missing hotel parameter" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("maintenance_tasks")
      .select("status")
      .eq("hotel", hotel)

    if (error) {
      console.error("[Supabase error]", error)
      return NextResponse.json({ error: "Database query failed", details: error.message }, { status: 500 })
    }

    const total = data.length
    const pending = data.filter((t) => t.status?.toLowerCase() === "pendiente").length
    const resolved = data.filter((t) => t.status?.toLowerCase() === "resuelto").length

    return NextResponse.json({ total, pending, resolved })
  } catch (err: any) {
    console.error("[API ERROR]", err)
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 })
  }
}
