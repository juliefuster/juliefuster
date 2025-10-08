import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");

    if (!hotel) {
      return NextResponse.json({ error: "Missing hotel parameter" }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("pump_change_records")
      .select("date, pump_number, operator_name")
      .eq("hotel", hotel)
      .order("date", { ascending: true });

    if (error) throw error;

    // Formateamos el historial para agrupar por mes
    const formatted = data.map((r) => {
      const dateObj = new Date(r.date);
      const month = dateObj.toLocaleString("es-ES", { month: "long" });
      const formattedDate = dateObj.toLocaleDateString("es-ES");
      return {
        mes: month.charAt(0).toUpperCase() + month.slice(1),
        fecha: formattedDate,
        numero_bomba: r.pump_number,
        responsable: r.operator_name,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("Error fetching pump change history:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch pump change history", details: err.message },
      { status: 500 }
    );
  }
}
