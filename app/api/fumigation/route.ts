import { NextResponse } from "next/server"
import { dataSource } from "../../../lib/data-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json([], { status: 200 })
    }

    const records = await dataSource.getFumigationRecords(hotel)
    return NextResponse.json(records)
  } catch (err: any) {
    console.error("Error fetching fumigation records:", err.message)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hotel, fumigatedRooms, operatorName, observations, date } = body

    if (!hotel || !fumigatedRooms || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await dataSource.createFumigationRecord({
      hotel,
      fumigatedRooms,
      operatorName,
      observations,
      date,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error("Error creating fumigation record:", err.message)
    return NextResponse.json({ error: "Failed to create fumigation record", details: err.message }, { status: 500 })
  }
}
