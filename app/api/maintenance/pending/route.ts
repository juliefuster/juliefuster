import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client"; // 👈 importante

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");

    const supabase = createClient();

    // 🔹 consulta
    let query = supabase
      .from("maintenance_tasks") // 👈 nombre exacto de tu tabla
      .select("*")
      .ilike("status", "%pendiente%") // busca sin importar mayúsculas/minúsculas
      .order("created_at", { ascending: false });

    // 🔹 filtro por hotel
    if (hotel) {
      query = query.eq("hotel", hotel);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔹 si no hay datos
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("🔥 Server error:", err.message || err);
    return NextResponse.json(
      { error: "Error al cargar las averías pendientes", details: err.message },
      { status: 500 }
    );
  }
}
