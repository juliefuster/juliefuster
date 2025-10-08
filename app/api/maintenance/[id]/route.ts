import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status, resolutionData } = await request.json();

  const supabase = createClient();
  const { error } = await supabase
    .from("maintenance_tasks")
    .update({
      status,
      resolved_at: resolutionData?.resolvedAt,
      resolved_by: resolutionData?.responsible,
      resolution_notes: resolutionData?.notes,
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

}
