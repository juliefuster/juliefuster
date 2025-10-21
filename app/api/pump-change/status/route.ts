import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const INTERVAL_DAYS = 7 // Semanal

export async function GET(request: NextRequest) {
  try {
    const hotel = request.nextUrl.searchParams.get("hotel")
    if (!hotel) return NextResponse.json({ error: "Falta el parámetro 'hotel'" }, { status: 400 })

    const supabase = createClient()

    const { data: records, error } = await supabase
      .from("pump_change_records")
      .select("date, pump_number, operator_name, observations")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (error) throw error

    const lastByPump: Record<string, { lastDate: string; operator?: string; observations?: string }> = {}
    for (const rec of records || []) {
      const pump = rec.pump_number?.toString() || "Sin número"
      if (!lastByPump[pump]) {
        lastByPump[pump] = {
          lastDate: rec.date.split("T")[0],
          operator: rec.operator_name,
          observations: rec.observations,
        }
      }
    }

    const today = new Date()
    const pumpsStatus = Object.entries(lastByPump).map(([pump, info]) => {
      const lastDate = new Date(info.lastDate)
      const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      const nextDate = new Date(lastDate.getTime() + INTERVAL_DAYS * 24 * 60 * 60 * 1000)

      let status = "upcoming"
      if (diff > INTERVAL_DAYS) status = "overdue"
      else if (diff >= INTERVAL_DAYS - 1) status = "soon"

      return {
        pump,
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
      total: pumpsStatus.length,
      clean: pumpsStatus.filter(r => r.status === "upcoming").length,
      soon: pumpsStatus.filter(r => r.status === "soon").length,
      overdue: pumpsStatus.filter(r => r.status === "overdue").length,
    }

    return NextResponse.json({ hotel, summary, pumps: pumpsStatus })
  } catch (err: any) {
    console.error("Error en bombas:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
