import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");

    // ⚠️ Verificación del parámetro hotel
    if (!hotel) {
      return NextResponse.json({ error: "Missing hotel parameter" }, { status: 400 });
    }

    const supabase = createClient();

    // 🔹 Consulta de averías resueltas (insensible a mayúsculas/minúsculas)
    const { data, error } = await supabase
      .from("maintenance_tasks") // 👈 asegúrate de que este sea el nombre real de tu tabla
      .select("*")
      .eq("hotel", hotel)
      .ilike("status", "%resuelta%")
      .order("resolved_at", { ascending: false });

    if (error) {
      console.error("❌ Error al obtener averías resueltas:", error);
      throw error;
    }

    // ⚙️ Formatear resultados para el frontend
    const formatted = (data || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      location: task.location,
      priority: task.priority,
      status: task.status,
      reportedBy: task.reported_by || task.reportedBy || "Sin asignar",
      createdAt: task.created_at,
      resolvedAt: task.resolved_at || null,
    }));

    // 🔹 Si no hay registros, devolver lista vacía (evita errores en frontend)
    if (!formatted.length) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(formatted, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching resolved issues:", err.message || err);
    return NextResponse.json(
      { error: "Failed to fetch resolved issues", details: err.message },
      { status: 500 }
    );
  }
}
