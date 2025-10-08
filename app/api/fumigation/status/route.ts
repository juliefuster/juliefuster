import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")
    const roomsParam = searchParams.get("rooms")

    if (!hotel || !roomsParam) {
      return NextResponse.json({ error: "Missing hotel or rooms parameter" }, { status: 400 })
    }

    const rooms = roomsParam.split(",")

    const { data, error } = await supabase
      .from("fumigation_records")
      .select("room, date, status")
      .eq("hotel", hotel)

    if (error) throw error

    // Calcula el estado de cada habitación (simple ejemplo)
    const today = new Date()
    const status = rooms.map((room) => {
      const record = data.find((r) => r.room === room)
      if (!record) return { room, status: "overdue" }

      const diffDays = (today.getTime() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays < 75) return { room, status: "upToDate" }
      if (diffDays < 90) return { room, status: "upcoming" }
      return { room, status: "overdue" }
    })

    return NextResponse.json(status)
  } catch (err: any) {
    console.error("Error fetching fumigation status:", err.message)
    return NextResponse.json(
      { error: "Failed to fetch fumigation status", details: err.message },
      { status: 500 }
    )
  }
}
