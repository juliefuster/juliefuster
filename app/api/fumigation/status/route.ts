import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const INTERVAL_DAYS = 90 // Trimestral

export async function GET(request: NextRequest) {
  try {
    const hotel = request.nextUrl.searchParams.get("hotel")
    if (!hotel) return NextResponse.json({ error: "Falta el parámetro 'hotel'" }, { status: 400 })

    const supabase = createClient()

    const { data: records, error } = await supabase
      .from("fumigation_records")
      .select("date, rooms, operator_name, observations")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (error) throw error

    const lastByRoom: Record<string, { lastDate: string; operator?: string; observations?: string }> = {}
    for (const rec of records || []) {
      const rooms =
        Array.isArray(rec.rooms)
          ? rec.rooms
          : typeof rec.rooms === "string" && rec.rooms.startsWith("[")
          ? JSON.parse(rec.rooms)
          : []

      for (const room of rooms) {
        if (!lastByRoom[room]) {
          lastByRoom[room] = {
            lastDate: rec.date.split("T")[0],
            operator: rec.operator_name,
            observations: rec.observations,
          }
        }
      }
    }

    const today = new Date()
    const roomsStatus = Object.entries(lastByRoom).map(([room, info]) => {
      const lastDate = new Date(info.lastDate)
      const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      const nextDate = new Date(lastDate.getTime() + INTERVAL_DAYS * 24 * 60 * 60 * 1000)

      let status = "upcoming"
      if (diff > INTERVAL_DAYS) status = "overdue"
      else if (diff >= INTERVAL_DAYS - 10) status = "soon"

      return {
        room,
        lastDate: info.lastDate,
        nextDate: nextDate.toISOString().split("T")[0],
        operator: info.operator || "N/A",
        observations: info.observations || "",
        daysSince: diff,
        daysRemaining: INTERVAL_DAYS - diff,
        status,
      }
    })

    const summary = {
      total: roomsStatus.length,
      clean: roomsStatus.filter(r => r.status === "upcoming").length,
      soon: roomsStatus.filter(r => r.status === "soon").length,
      overdue: roomsStatus.filter(r => r.status === "overdue").length,
    }

    return NextResponse.json({ hotel, summary, rooms: roomsStatus })
  } catch (err: any) {
    console.error("Error en fumigación:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
