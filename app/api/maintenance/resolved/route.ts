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
      .from("maintenance_tasks")
      .select("*")
      .eq("hotel", hotel)
      .ilike("status", "%resuelta%") // 🔍 busca sin importar mayúsculas/minúsculas
      .order("resolved_at", { ascending: false });

    if (error) throw error;

    const formatted = data.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      location: task.location,
      priority: task.priority,
      status: task.status,
      reportedBy: task.reported_by,
      createdAt: task.created_at,
      resolvedAt: task.resolved_at,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("Error fetching resolved issues:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch resolved issues", details: err.message },
      { status: 500 }
    );
  }
}
