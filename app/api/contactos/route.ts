import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.STORAGE_SUPABASE_URL!, process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")
    const departamento = searchParams.get("departamento")

    let query = supabase.from("contactos").select("*").order("nombre", { ascending: true })

    if (hotel && hotel !== "all") {
      query = query.or(`hotel.eq.${hotel},hotel.eq.Ambos`)
    }

    if (departamento && departamento !== "all") {
      query = query.eq("departamento", departamento)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching contacts:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error in GET /api/contactos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase.from("contactos").insert([body]).select().single()

    if (error) {
      console.error("[v0] Error creating contact:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in POST /api/contactos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
