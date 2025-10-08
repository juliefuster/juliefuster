import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const lastDate = await dataSource.getLastFumigationDate(hotel)

    return NextResponse.json({ lastDate })
  } catch (error) {
    console.error("Error fetching last fumigation date:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
