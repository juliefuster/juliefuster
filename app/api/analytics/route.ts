import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hotel = searchParams.get("hotel")

  if (!hotel) {
    return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Get current month start and end dates
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch fumigation records
    const { data: fumigations, error: fumError } = await supabase
      .from("fumigation_records")
      .select("*")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (fumError) throw fumError

    // Fetch filter cleaning records
    const { data: filterCleanings, error: filterError } = await supabase
      .from("filter_cleaning_records")
      .select("*")
      .eq("hotel", hotel)
      .order("created_at", { ascending: false })

    if (filterError) throw filterError

    // Fetch pump change records
    const { data: pumpChanges, error: pumpError } = await supabase
      .from("pump_change_records")
      .select("*")
      .eq("hotel", hotel)
      .order("date", { ascending: false })

    if (pumpError) throw pumpError

    // Calculate metrics
    const allTasks = [
      ...fumigations.map((f) => ({
        type: "Fumigación",
        date: new Date(f.date),
        operator: f.operator_name,
        expectedInterval: 90,
      })),
      ...filterCleanings.map((f) => ({
        type: "Limpieza de filtros",
        date: new Date(f.created_at),
        operator: f.operator_name,
        expectedInterval: 15,
      })),
      ...pumpChanges.map((p) => ({
        type: "Cambio de bombas",
        date: new Date(p.date),
        operator: p.operator_name,
        expectedInterval: 7,
      })),
    ]

    // Sort by date
    allTasks.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Tasks completed this month
    const tasksThisMonth = allTasks.filter((t) => t.date >= monthStart && t.date <= monthEnd)

    // Calculate average days between tasks by type
    const calculateAvgInterval = (tasks: typeof allTasks, type: string) => {
      const typeTasks = tasks.filter((t) => t.type === type).sort((a, b) => a.date.getTime() - b.date.getTime())
      if (typeTasks.length < 2) return 0

      let totalDays = 0
      let count = 0
      for (let i = 1; i < typeTasks.length; i++) {
        const days = Math.floor((typeTasks[i].date.getTime() - typeTasks[i - 1].date.getTime()) / (1000 * 60 * 60 * 24))
        totalDays += days
        count++
      }
      return count > 0 ? Math.round(totalDays / count) : 0
    }

    const avgFumigation = calculateAvgInterval(allTasks, "Fumigación")
    const avgFilter = calculateAvgInterval(allTasks, "Limpieza de filtros")
    const avgPump = calculateAvgInterval(allTasks, "Cambio de bombas")

    // Calculate % completed on time
    const calculateOnTimePercentage = (tasks: typeof allTasks, type: string, expectedInterval: number) => {
      const typeTasks = tasks.filter((t) => t.type === type).sort((a, b) => a.date.getTime() - b.date.getTime())
      if (typeTasks.length < 2) return 100

      let onTimeCount = 0
      for (let i = 1; i < typeTasks.length; i++) {
        const days = Math.floor((typeTasks[i].date.getTime() - typeTasks[i - 1].date.getTime()) / (1000 * 60 * 60 * 24))
        if (days <= expectedInterval + 2) {
          // Allow 2 days grace period
          onTimeCount++
        }
      }
      return Math.round((onTimeCount / (typeTasks.length - 1)) * 100)
    }

    const fumigationOnTime = calculateOnTimePercentage(allTasks, "Fumigación", 90)
    const filterOnTime = calculateOnTimePercentage(allTasks, "Limpieza de filtros", 15)
    const pumpOnTime = calculateOnTimePercentage(allTasks, "Cambio de bombas", 7)

    // Overall on-time percentage
    const overallOnTime = Math.round((fumigationOnTime + filterOnTime + pumpOnTime) / 3)

    // Top operator
    const operatorCounts: Record<string, number> = {}
    allTasks.forEach((t) => {
      if (t.operator) {
        operatorCounts[t.operator] = (operatorCounts[t.operator] || 0) + 1
      }
    })
    const topOperator = Object.entries(operatorCounts).sort((a, b) => b[1] - a[1])[0]

    // Tasks per day (last 30 days)
    const tasksPerDay: Record<string, number> = {}
    allTasks
      .filter((t) => t.date >= thirtyDaysAgo)
      .forEach((t) => {
        const dateStr = t.date.toISOString().split("T")[0]
        tasksPerDay[dateStr] = (tasksPerDay[dateStr] || 0) + 1
      })

    // Tasks by operator
    const tasksByOperator = Object.entries(operatorCounts).map(([name, count]) => ({
      name,
      count,
    }))

    // Detail table data
    const detailData = [
      {
        type: "Fumigación",
        lastDate: fumigations[0]?.date || null,
        avgInterval: avgFumigation,
        totalMonth: tasksThisMonth.filter((t) => t.type === "Fumigación").length,
        onTimePercent: fumigationOnTime,
      },
      {
        type: "Limpieza de filtros",
        lastDate: filterCleanings[0]?.created_at || null,
        avgInterval: avgFilter,
        totalMonth: tasksThisMonth.filter((t) => t.type === "Limpieza de filtros").length,
        onTimePercent: filterOnTime,
      },
      {
        type: "Cambio de bombas",
        lastDate: pumpChanges[0]?.date || null,
        avgInterval: avgPump,
        totalMonth: tasksThisMonth.filter((t) => t.type === "Cambio de bombas").length,
        onTimePercent: pumpOnTime,
      },
    ]

    return NextResponse.json({
      kpis: {
        totalTasksMonth: tasksThisMonth.length,
        avgDaysBetweenTasks: Math.round((avgFumigation + avgFilter + avgPump) / 3),
        onTimePercent: overallOnTime,
        topOperator: topOperator ? { name: topOperator[0], count: topOperator[1] } : null,
      },
      tasksPerDay,
      tasksByOperator,
      avgIntervalByType: [
        { type: "Fumigación", days: avgFumigation },
        { type: "Limpieza de filtros", days: avgFilter },
        { type: "Cambio de bombas", days: avgPump },
      ],
      detailData,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Error fetching analytics data" }, { status: 500 })
  }
}
