import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("pump_change_records")
      .select("created_at")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) throw error

    const lastDate = data?.[0]?.created_at ?? null
    return NextResponse.json({ lastDate })
  } catch (err: any) {
    console.error("Error fetching last pump change date:", err.message)
    return NextResponse.json(
      { error: "Failed to fetch last pump change date", details: err.message },
      { status: 500 }
    )
  }
}
