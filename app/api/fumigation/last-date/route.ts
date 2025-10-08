import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hotel, operatorName, observations } = body;

    // Si vienen habitaciones, las ignoramos (solo registramos por fecha/hotel)
    if (!hotel || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    const today = new Date().toISOString().split("T")[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);

    const { error } = await supabase.from("fumigation_records").insert([
      {
        hotel,
        date: today,
        next_date: nextDate.toISOString().split("T")[0],
        operator_name: operatorName,
        observations: observations || null,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Fumigación registrada exitosamente" });
  } catch (err: any) {
    console.error("Error inserting fumigation record:", err.message);
    return NextResponse.json(
      { error: "Failed to insert fumigation record", details: err.message },
      { status: 500 }
    );
  }
}
