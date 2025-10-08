import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")

    if (!hotel) {
      return NextResponse.json(
        { error: "Falta el parámetro hotel" },
        { status: 400 }
      )
    }

    // 🔹 Consultamos la última fecha de limpieza de filtros para ese hotel
    const { data, error } = await supabase
      .from("filter_cleanings") // 👈 cambia este nombre si tu tabla se llama distinto
      .select("date")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("❌ Error al obtener la fecha desde Supabase:", error)
      throw error
    }

    // Si no hay registros, devolvemos null
    const lastDate = data?.date ?? null

    return NextResponse.json({ lastDate })
  } catch (error) {
    console.error("Error fetching last filter cleaning date:", error)
    return NextResponse.json(
      { error: "Error al obtener la última fecha de limpieza" },
      { status: 500 }
    )
  }
}
