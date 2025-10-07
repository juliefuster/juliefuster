import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter required" }, { status: 400 })
    }

    const lastDate = await dataSource.getLastFilterCleaningDate(hotel)
    return NextResponse.json({ lastDate })
  } catch (error) {
    console.error("Error fetching last filter cleaning date:", error)
    return NextResponse.json({ error: "Failed to fetch last date" }, { status: 500 })
  }
}
