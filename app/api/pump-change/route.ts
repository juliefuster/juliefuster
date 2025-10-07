import { dataSource } from "../../../lib/data-source"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    const records = await dataSource.getPumpChangeRecords(hotel || undefined)

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching pump change records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, pumpNumber, operatorName, observations } = body

    if (!hotel || !pumpNumber || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await dataSource.createPumpChangeRecord({
      hotel,
      pumpNumber,
      operatorName,
      observations: observations || null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating pump change record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
