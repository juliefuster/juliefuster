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
      .select("date")
      .eq("hotel", hotel)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // sin datos no es error fatal

    return NextResponse.json({ lastDate: data ? data.date : null });
  } catch (err: any) {
    console.error("Error fetching last pump change date:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch last pump change date", details: err.message },
      { status: 500 }
    );
  }
}
