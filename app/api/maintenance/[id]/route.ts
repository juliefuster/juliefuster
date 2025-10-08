import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log("[v0] PATCH /api/maintenance/[id] called")
  try {
    const { id } = params
    const body = await request.json()
    const { status, resolutionData } = body

    console.log("[v0] Updating issue:", id, "to status:", status)

    const updatedIssue = await dataSource.updateIssueStatus(id, status, resolutionData)

    console.log("[v0] Issue updated successfully")
    return NextResponse.json(updatedIssue)
  } catch (error) {
    console.error("[v0] Error updating issue:", error)
    return NextResponse.json({ error: "Error al actualizar la avería" }, { status: 500 })
  }
}
