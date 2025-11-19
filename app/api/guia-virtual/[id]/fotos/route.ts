import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("guia_fotos")
      .select("*")
      .eq("guia_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("❌ Error GET /api/guia-virtual/[id]/fotos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    if (!body.url) {
      return NextResponse.json({ error: "Missing photo URL" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("guia_fotos")
      .insert({
        guia_id: params.id,
        url: body.url,
        descripcion: body.descripcion || null,
        subido_por: body.subido_por || "Desconocido",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error POST /api/guia-virtual/[id]/fotos:", error)
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("photoId")

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 })
    }

    // Obtener la foto antes de borrarla (para eliminar del storage también)
    const { data: photo } = await supabase
      .from("guia_fotos")
      .select("url")
      .eq("id", photoId)
      .single()

    // Borrar de la base de datos
    const { error } = await supabase.from("guia_fotos").delete().eq("id", photoId)
    if (error) throw error

    // Borrar también del Storage si existe URL
    if (photo?.url) {
      const path = photo.url.split("/guia_virtual_fotos/")[1] // ejemplo: "id/nombre.png"
      if (path) {
        await supabase.storage.from("guia_virtual_fotos").remove([path])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error DELETE /api/guia-virtual/[id]/fotos:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
