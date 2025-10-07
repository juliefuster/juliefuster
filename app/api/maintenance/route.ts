import { NextResponse } from "next/server"
import { dataSource } from "../../../lib/data-source"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, location, priority, reportedBy, hotel } = body

    const result = await dataSource.createIssue({
      title,
      description: description || null,
      category,
      location,
      priority,
      reportedBy,
      hotel,
    })

    return NextResponse.json({
      success: true,
      id: result.id,
    })
  } catch (error) {
    console.error("Error creating maintenance issue:", error)
    return NextResponse.json({ error: "Error al crear la avería" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel") || undefined

    const issues = await dataSource.getAllIssues(hotel)
    return NextResponse.json(issues)
  } catch (error) {
    console.error("Error fetching maintenance issues:", error)
    return NextResponse.json({ error: "Error al cargar las averías" }, { status: 500 })
  }
}
