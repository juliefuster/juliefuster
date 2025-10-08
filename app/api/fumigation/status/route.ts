import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")
    const roomsParam = searchParams.get("rooms")

    if (!hotel || !roomsParam) {
      return NextResponse.json({ error: "Missing hotel or rooms parameter" }, { status: 400 })
    }

    const rooms = roomsParam.split(",")

    // Get fumigation status from data source (with fallback to mock data)
    const status = await dataSource.getFumigationStatus(hotel, rooms)

    return NextResponse.json(status)
  } catch (err: any) {
    console.error("[v0] Error in fumigation status API:", err.message)
    return NextResponse.json([])
  }
}
