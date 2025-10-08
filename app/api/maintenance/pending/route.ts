import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client"; // ✅ se usa createClient, no supabase

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");

    // 🔹 Conexión segura a Supabase
    const supabase = createClient();

    // 🔹 Consulta de averías pendientes
    let query = supabase
      .from("maintenance_tasks") // 👈 asegúrate que este sea el nombre exacto de tu tabla
      .select("*")
      .ilike("status", "%pendiente%") // ✅ busca sin importar mayúsculas/minúsculas
      .order("created_at", { ascending: false });

    // 🔹 Filtro por hotel si existe
    if (hotel) {
      query = query.eq("hotel", hotel);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error al obtener datos de Supabase:", error);
      throw error;
    }

    // 🔹 Si no hay datos
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching pending issues:", error.message || error);
    return NextResponse.json(
      { error: "Error al cargar las averías pendientes", details: error.message },
      { status: 500 }
    );
  }
}
