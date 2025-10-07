import { dataSource } from "../../../../lib/data-source"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    const lastDate = await dataSource.getLastPumpChangeDate(hotel)

    return NextResponse.json({ lastDate })
  } catch (error) {
    console.error("Error fetching last pump change date:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
