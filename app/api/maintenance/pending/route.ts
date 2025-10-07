import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel") || undefined

    const issues = await dataSource.getPendingIssues(hotel)
    return NextResponse.json(issues)
  } catch (error) {
    console.error("Error fetching pending issues:", error)
    return NextResponse.json({ error: "Error al cargar las averías pendientes" }, { status: 500 })
  }
}
