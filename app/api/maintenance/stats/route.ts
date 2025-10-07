import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: Request) {
  console.log("[v0] Stats API called")
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel") || undefined
    console.log("[v0] Hotel parameter:", hotel)

    const stats = await dataSource.getStats(hotel)
    console.log("[v0] Stats retrieved:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 })
  }
}
