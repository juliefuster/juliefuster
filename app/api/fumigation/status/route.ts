import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");
    const roomsParam = searchParams.get("rooms");

    if (!hotel || !roomsParam) {
      return NextResponse.json(
        { error: "Missing hotel or rooms parameter" },
        { status: 400 }
      );
    }

    const rooms = roomsParam.split(",").map((r) => r.trim());
    const supabase = createClient();

    // Leer última fumigación registrada
    const { data, error } = await supabase
      .from("fumigation_records")
      .select("date, observations")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        rooms.map((room) => ({
          room,
          status: "pendiente",
          last_date: null,
          notes: null,
        }))
      );
    }

    const last = data[0];
    const response = rooms.map((room) => ({
      room,
      status: "fumigada",
      last_date: last.date,
      notes: last.observations || null,
    }));

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[v0] Error in fumigation status API:", err.message);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
