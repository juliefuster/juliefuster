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

    // 🔹 Obtenemos solo las averías con estado "resuelta"
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select(
        `id, title, description, category, location, priority, status, reported_by, 
         resolution_responsible, created_at, resolved_at, resolution_notes`
      )
      .eq("hotel", hotel)
      .ilike("status", "%resuelta%")
      .order("resolved_at", { ascending: false });

    if (error) throw error;

    // 🔹 Formateamos los nombres de campos para que coincidan con tu front
    const formatted = data.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      location: task.location,
      priority: task.priority,
      status: task.status,
      reportedBy: task.reported_by,
      resolvedBy: task.resolution_responsible || "N/A",
      createdAt: task.created_at,
      resolvedAt: task.resolved_at,
      notes: task.resolution_notes || "",
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
