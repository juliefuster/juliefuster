import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel") || undefined

    const records = await dataSource.getFilterCleaningRecords(hotel)
    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching filter cleaning records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, cleanedFilters, operatorName, observations } = body

    if (!hotel || !cleanedFilters || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await dataSource.createFilterCleaningRecord({
      hotel,
      cleanedFilters,
      operatorName,
      observations: observations || null,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating filter cleaning record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}
