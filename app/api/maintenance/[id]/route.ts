import { NextResponse } from "next/server"
import { dataSource } from "../../../../lib/data-source"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, completionDate, responsible, repairDescription } = body

    await dataSource.updateIssueStatus(params.id, status, {
      completionDate,
      responsible,
      repairDescription,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating issue:", error)
    return NextResponse.json({ error: "Error al actualizar la avería" }, { status: 500 })
  }
}
