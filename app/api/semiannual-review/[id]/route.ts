import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, observations } = body
    const { id } = params

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Update the record
    const { data: updateData, error: updateError } = await supabase
      .from("semiannual_inspection_records")
      .update({
        status,
        observations,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Supabase update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If status is "Mal", create a pending task in the calendar
    if (status === "Mal") {
      const record = updateData
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + 7) // 7 days from now

      // Note: This would require adding the task to a pending_tasks table or similar
      // For now, we'll just log it
      console.log("[v0] Creating pending task for:", record.item, "due:", nextDate.toISOString().split("T")[0])
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
