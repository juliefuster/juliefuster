import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("shower_grout_records")
      .select("date")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lastDate: data?.date || null })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
