import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// 📍 GET → obtener registros de tareas mensuales
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const hotel = searchParams.get("hotel")
    const taskId = searchParams.get("taskId")

    let query = supabase.from("monthly_task_records").select("*").order("date", { ascending: false })

    if (hotel) query = query.eq("hotel", hotel)
    if (taskId) query = query.eq("task_id", Number.parseInt(taskId))

    const { data: allRecords, error } = await query

    if (error) {
      console.error("❌ Error al obtener registros desde Supabase:", error)
      throw error
    }

    const taskEntries: any[] = []
    const taskLastCompletionMap: Record<string, Date> = {}

    // Sort records by date ascending to process chronologically
    const sortedRecords = [...(allRecords || [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    sortedRecords.forEach((record) => {
      const taskName = record.task_name
      const recordDate = new Date(record.date)
      const previousCompletionDate = taskLastCompletionMap[taskName]

      let diferencia_dias: number | null = null
      let estado: "adelantada" | "correcta" = "correcta"

      if (previousCompletionDate) {
        const diffMs = recordDate.getTime() - previousCompletionDate.getTime()
        diferencia_dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        // Monthly tasks cycle is 30 days
        if (diferencia_dias < 30) {
          estado = "adelantada"
        }
      }

      // Calculate next_date from record's next_date or 30 days after completion
      const nextDate = record.next_date
        ? new Date(record.next_date)
        : new Date(recordDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      taskEntries.push({
        ...record,
        next_date: nextDate.toISOString().split("T")[0],
        diferencia_dias,
        estado,
      })

      // Update the last completion date for this task
      taskLastCompletionMap[taskName] = recordDate
    })

    // Sort by date descending for display
    taskEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log("[v0] Monthly task entries created:", taskEntries.length)
    return NextResponse.json(taskEntries)
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
