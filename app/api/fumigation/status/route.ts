import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")
    const roomsParam = searchParams.get("rooms")

    if (!hotel || !roomsParam) {
      return NextResponse.json({ error: "Missing hotel or rooms parameter" }, { status: 400 })
    }

    const rooms = roomsParam.split(",")
    const status = await dataSource.getFumigationStatus(hotel, rooms)

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error fetching fumigation status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
