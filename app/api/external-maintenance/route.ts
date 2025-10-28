import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotel = searchParams.get("hotel")
    const taskType = searchParams.get("taskType")

    if (!hotel) {
      return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
    }

    let query = `
      SELECT * FROM external_maintenance_records 
      WHERE hotel = $1
    `
    const params: any[] = [hotel]

    if (taskType) {
      query += ` AND task_type = $2`
      params.push(taskType)
    }

    query += ` ORDER BY date DESC, created_at DESC`

    const records = await sql(query, params)

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching external maintenance records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotel, taskType, date, workDone, operatorName, hotelPersonPresent, replacementMaterials, observations } =
      body

    if (!hotel || !taskType || !operatorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql(
      `
      INSERT INTO external_maintenance_records 
      (hotel, task_type, date, work_done, operator_name, hotel_person_present, replacement_materials, observations)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        hotel,
        taskType,
        date || new Date().toISOString().split("T")[0],
        workDone || null,
        operatorName,
        hotelPersonPresent || null,
        replacementMaterials ? JSON.stringify(replacementMaterials) : null,
        observations || null,
      ],
    )

    return NextResponse.json({ success: true, record: result[0] })
  } catch (error) {
    console.error("Error creating external maintenance record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}
