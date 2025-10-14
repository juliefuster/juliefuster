import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extraemos y normalizamos campos del cuerpo
    const hotel = body.hotel;
    const dateInput = body.date ?? body.fecha ?? body.fechaFumigacion;
    const operatorName =
      body.operatorName ?? body.operator_name ?? body.responsable;
    const observations = body.observations ?? body.comentarios ?? "";
    const nextDateInput = body.nextDate ?? body.next_date ?? null;

    // Validar campos obligatorios
    if (!hotel || !dateInput || !operatorName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (hotel, date, operatorName)" },
        { status: 400 }
      );
    }

    // Función para convertir fecha a formato YYYY-MM-DD
    const formatDate = (d: string) => new Date(d).toISOString().split("T")[0];

    // Objeto a insertar
    const payload = {
      hotel,
      date: formatDate(dateInput),
      operator_name: operatorName,
      observations,
      next_date: nextDateInput ? formatDate(nextDateInput) : null,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();

    // Insertar registro en la tabla
    const { error } = await supabase
      .from("fumigation_records")
      .insert([payload]);

    if (error) {
      console.error("❌ Error al insertar en fumigation_records:", error.message);
      throw error;
    }

    console.log("✅ Registro de fumigación guardado correctamente");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("💥 Error general al guardar fumigación:", err?.message || err);
    return NextResponse.json(
      {
        error: "No se pudo guardar la fumigación",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
