import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// 📍 GET → obtener registros de tareas mensuales
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")
    const taskId = searchParams.get("taskId")

    // Construimos la consulta dinámica
    let query = supabase.from("monthly_task_records").select("*").order("date", { ascending: false })

    if (hotel) query = query.eq("hotel", hotel)
    if (taskId) query = query.eq("task_id", Number.parseInt(taskId))

    const { data, error } = await query

    if (error) {
      console.error("❌ Error al obtener registros desde Supabase:", error)
      throw error
    }

    console.log("[v0] Monthly task records fetched:", data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching monthly task records:", error)
    return NextResponse.json({ error: "Error al obtener los registros de tareas mensuales" }, { status: 500 })
  }
}

// 📍 POST → registrar nueva tarea mensual completada
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { hotel, taskId, taskName, operatorName, observations } = body

    if (!hotel || !taskId || !taskName || !operatorName) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Insertar nuevo registro
    const { data, error } = await supabase
      .from("monthly_task_records")
      .insert([
        {
          hotel,
          task_id: taskId,
          task_name: taskName,
          operator_name: operatorName,
          observations: observations || null,
          date: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error al crear registro en Supabase:", error)
      throw error
    }

    console.log("[v0] Monthly task record created successfully")
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating monthly task record:", error)
    return NextResponse.json({ error: "Error al crear el registro de tarea mensual" }, { status: 500 })
  }
}
