import { type NextRequest, NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")
    const taskId = searchParams.get("taskId")

    const records = await dataSource.getMonthlyTaskRecords(
      hotel || undefined,
      taskId ? Number.parseInt(taskId) : undefined,
    )

    return NextResponse.json(records)
  } catch (error) {
    console.error("[v0] Error fetching monthly task records:", error)
    return NextResponse.json({ error: "Failed to fetch monthly task records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, taskId, taskName, operatorName, observations } = body

    if (!hotel || !taskId || !taskName || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await dataSource.createMonthlyTaskRecord({
      hotel,
      taskId,
      taskName,
      operatorName,
      observations: observations || null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error creating monthly task record:", error)
    return NextResponse.json({ error: "Failed to create monthly task record" }, { status: 500 })
  }
}
