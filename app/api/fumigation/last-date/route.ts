import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const hotel = searchParams.get("hotel")
    if (!hotel) return NextResponse.json({ error: "Missing hotel" }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("fumigation_records")
      .select("date")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)

    if (error) throw error

    return NextResponse.json(
      { lastDate: data?.[0]?.date ?? null },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e: any) {
    console.error("[last-date:fumigation] error:", e?.message)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
