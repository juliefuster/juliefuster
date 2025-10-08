import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: Request) {
  console.log("[v0] [API] /maintenance/stats called")

  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Missing hotel parameter" }, { status: 400 })
    }

    const stats = await dataSource.getStats(hotel)
    console.log("[v0] [API] Stats retrieved:", stats)

    return NextResponse.json(stats)
  } catch (err: any) {
    console.error("[v0] [API ERROR]", err)
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 })
  }
}
