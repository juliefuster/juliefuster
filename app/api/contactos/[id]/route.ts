import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.STORAGE_SUPABASE_URL!, process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY!)

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase.from("contactos").update(body).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error updating contact:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in PUT /api/contactos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
