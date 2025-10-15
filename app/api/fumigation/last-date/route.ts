import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hotel, date, operator_name, observations } = body;

    if (!hotel || !date || !operator_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    // 👇 OJO: quitamos next_date y created_at del insert
    const { error } = await supabase
      .from("fumigation_records")
      .insert([{ hotel, date, operator_name, observations: observations || "" }])
      .select("id, hotel, date, operator_name, observations"); // 👈 sin next_date ni created_at

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("💥 Error general al guardar fumigación:", err.message);
    return NextResponse.json(
      { error: "No se pudo guardar la fumigación", details: err.message },
      { status: 500 }
    );
  }
}
