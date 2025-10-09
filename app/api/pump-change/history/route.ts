import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = createClient()

  const { searchParams } = new URL(req.url)
  const hotel = searchParams.get("hotel")

  if (!hotel) {
    return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("pump_change_records")
      .select("*")
      .eq("hotel", hotel)
      .order("fecha", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching pump change records:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
