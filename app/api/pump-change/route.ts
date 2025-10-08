import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hotel, pumpNumber, operatorName, observations } = body;

    if (!hotel || !pumpNumber || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase.from("pump_change_records").insert([
      {
        hotel,
        pump_number: pumpNumber,       // 👈 debe coincidir con la columna real
        operator_name: operatorName,   // 👈 igual
        observations,
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error inserting pump change record:", err.message);
    return NextResponse.json(
      { error: "Failed to insert pump change record", details: err.message },
      { status: 500 }
    );
  }
}
