import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json(
        { error: "Falta el parámetro hotel" },
        { status: 400 }
      )
    }

    // 🔹 Consultamos la última fecha registrada del cambio de bomba para ese hotel
    const { data, error } = await supabase
      .from("pump_changes") // 👈 cambia este nombre si tu tabla se llama distinto
      .select("date")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("❌ Error al obtener fecha desde Supabase:", error)
      throw error
    }

    const lastDate = data?.date ?? null

    return NextResponse.json({ lastDate })
  } catch (error) {
    console.error("Error fetching last pump change date:", error)
    return NextResponse.json(
      { error: "Error al obtener la última fecha de cambio de bomba" },
      { status: 500 }
    )
  }
}
