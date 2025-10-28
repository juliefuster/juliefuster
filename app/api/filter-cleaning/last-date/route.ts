import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const hotel = searchParams.get("hotel")
    if (!hotel) return NextResponse.json({ error: "Missing hotel" }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("filter_cleaning_records")
      .select("created_at")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) throw error

    // Normalizamos a ISO date (YYYY-MM-DD)
    const last = data?.[0]?.created_at ? new Date(data[0].created_at).toISOString() : null

    return NextResponse.json(
      { lastDate: last },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e: any) {
    console.error("[last-date:filter] error:", e?.message)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
