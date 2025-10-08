import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotel = searchParams.get("hotel");
    const roomsParam = searchParams.get("rooms");

    if (!hotel || !roomsParam) {
      return NextResponse.json([], { status: 200 }); // 🔹 Devuelve array vacío si falta info
    }

    const rooms = roomsParam.split(",");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("fumigation_records")
      .select("room, date, status")
      .eq("hotel", hotel);

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json([], { status: 200 }); // 🔹 Devuelve array vacío si hay error
    }

    // 🔹 Si no hay registros, devolvemos todas como vencidas
    if (!data || data.length === 0) {
      return NextResponse.json(rooms.map((room) => ({ room, status: "overdue" })));
    }

    // 🔹 Calcula el estado según la fecha
    const today = new Date();
    const result = rooms.map((room) => {
      const record = data.find((r) => r.room === room);
      if (!record) return { room, status: "overdue" };

      const diffDays = (today.getTime() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 75) return { room, status: "upToDate" };
      if (diffDays < 90) return { room, status: "upcoming" };
      return { room, status: "overdue" };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("💥 Error fetching fumigation status:", err.message);
    // 🔹 Siempre devolvemos un array, para que el frontend no falle
    return NextResponse.json([], { status: 200 });
  }
}
