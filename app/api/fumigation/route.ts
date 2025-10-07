import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    const records = await dataSource.getFumigationRecords(hotel || undefined)
    return NextResponse.json(records)
  } catch (error) {
    console.error("[v0] Error fetching fumigation records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, fumigatedRooms, operatorName, observations } = body

    if (!hotel || !fumigatedRooms || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await dataSource.createFumigationRecord({
      hotel,
      fumigatedRooms,
      operatorName,
      observations: observations || null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error creating fumigation record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
