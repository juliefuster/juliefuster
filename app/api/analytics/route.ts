import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hotel = searchParams.get("hotel")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const taskType = searchParams.get("taskType")
  const operator = searchParams.get("operator")

  if (!hotel) {
    return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const now = new Date()
    const monthStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [fumigations, filterCleanings, pumpChanges] = await Promise.all([
      supabase
        .from("fumigation_records")
        .select("*")
        .eq("hotel", hotel)
        .gte("date", monthStart.toISOString())
        .lte("date", monthEnd.toISOString())
        .order("date", { ascending: true }),
      supabase
        .from("filter_cleaning_records")
        .select("*")
        .eq("hotel", hotel)
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("pump_change_records")
        .select("*")
        .eq("hotel", hotel)
        .gte("date", monthStart.toISOString())
        .lte("date", monthEnd.toISOString())
        .order("date", { ascending: true }),
    ])

    if (fumigations.error) throw fumigations.error
    if (filterCleanings.error) throw filterCleanings.error
    if (pumpChanges.error) throw pumpChanges.error

    const allTasks = [
      ...(fumigations.data || []).map((f) => ({
        type: "Fumigación",
        date: new Date(f.date),
        operator: f.operator_name,
        expectedInterval: 90,
        rooms: f.rooms,
      })),
      ...(filterCleanings.data || []).map((f) => ({
        type: "Limpieza de filtros",
        date: new Date(f.created_at),
        operator: f.operator_name,
        expectedInterval: 15,
        rooms: f.cleaned_filters,
      })),
      ...(pumpChanges.data || []).map((p) => ({
        type: "Cambio de bombas",
        date: new Date(p.date),
        operator: p.operator_name,
        expectedInterval: 7,
        rooms: p.pump_number,
      })),
    ]

    let filteredTasks = allTasks
    if (taskType && taskType !== "all") {
      filteredTasks = filteredTasks.filter((t) => t.type === taskType)
    }
    if (operator && operator !== "all") {
      filteredTasks = filteredTasks.filter((t) => t.operator === operator)
    }

    filteredTasks.sort((a, b) => a.date.getTime() - b.date.getTime())

    const totalTasksMonth = filteredTasks.length

    // Calculate average days between tasks
    const calcAvgInterval = (tasks: any[], type: string) => {
      const filtered = tasks.filter((t) => t.type === type)
      if (filtered.length < 2) return 0
      let sum = 0
      for (let i = 1; i < filtered.length; i++) {
        sum += (filtered[i].date.getTime() - filtered[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
      }
      return Math.round(sum / (filtered.length - 1))
    }

    const avgFumigation = calcAvgInterval(filteredTasks, "Fumigación")
    const avgFilter = calcAvgInterval(filteredTasks, "Limpieza de filtros")
    const avgPump = calcAvgInterval(filteredTasks, "Cambio de bombas")

    const avgValues = [avgFumigation, avgFilter, avgPump].filter((v) => v > 0)
    const avgDaysBetweenTasks = avgValues.length
      ? Math.round(avgValues.reduce((a, b) => a + b, 0) / avgValues.length)
      : 0

    // Calculate on-time percentage
    const calcOnTime = (tasks: any[], type: string, expected: number) => {
      const filtered = tasks.filter((t) => t.type === type)
      if (filtered.length < 2) return null
      let onTime = 0
      for (let i = 1; i < filtered.length; i++) {
        const diffDays = (filtered[i].date.getTime() - filtered[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays <= expected + 2) onTime++
      }
      return Math.round((onTime / (filtered.length - 1)) * 100)
    }

    const fumigationOnTime = calcOnTime(filteredTasks, "Fumigación", 90) ?? 0
    const filterOnTime = calcOnTime(filteredTasks, "Limpieza de filtros", 15) ?? 0
    const pumpOnTime = calcOnTime(filteredTasks, "Cambio de bombas", 7) ?? 0

    const onTimeArray = [fumigationOnTime, filterOnTime, pumpOnTime].filter((v) => v > 0)
    const overallOnTime = onTimeArray.length
      ? Math.round(onTimeArray.reduce((a, b) => a + b, 0) / onTimeArray.length)
      : 0

    // Top operator
    const operatorCounts: Record<string, number> = {}
    filteredTasks.forEach((t) => {
      if (t.operator && t.operator.trim() !== "") {
        operatorCounts[t.operator] = (operatorCounts[t.operator] || 0) + 1
      }
    })
    const topOperatorEntry = Object.entries(operatorCounts).sort((a, b) => b[1] - a[1])[0]
    const topOperator = topOperatorEntry ? { name: topOperatorEntry[0], count: topOperatorEntry[1] } : null

    const start = new Date(monthStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(monthEnd)
    end.setHours(23, 59, 59, 999)

    const ymd = (d: Date) => {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${yyyy}-${mm}-${dd}`
    }

    const tasksPerDayMap: Record<string, number> = {}
    const currentDate = new Date(start)
    while (currentDate <= end) {
      tasksPerDayMap[ymd(currentDate)] = 0
      currentDate.setDate(currentDate.getDate() + 1)
    }

    filteredTasks.forEach((t) => {
      const key = ymd(t.date)
      if (key in tasksPerDayMap) {
        tasksPerDayMap[key] += 1
      }
    })

    const tasksPerDaySeries = Object.keys(tasksPerDayMap)
      .sort()
      .map((key) => ({ date: key, count: tasksPerDayMap[key] }))

    const detailData = [
      {
        type: "Fumigación",
        lastDate: fumigations.data?.at(-1)?.date || null,
        avgInterval: avgFumigation,
        totalMonth: filteredTasks.filter((t) => t.type === "Fumigación").length,
        onTimePercent: fumigationOnTime,
      },
      {
        type: "Limpieza de filtros",
        lastDate: filterCleanings.data?.at(-1)?.created_at || null,
        avgInterval: avgFilter,
        totalMonth: filteredTasks.filter((t) => t.type === "Limpieza de filtros").length,
        onTimePercent: filterOnTime,
      },
      {
        type: "Cambio de bombas",
        lastDate: pumpChanges.data?.at(-1)?.date || null,
        avgInterval: avgPump,
        totalMonth: filteredTasks.filter((t) => t.type === "Cambio de bombas").length,
        onTimePercent: pumpOnTime,
      },
    ]

    const uniqueOperators = Array.from(new Set(allTasks.map((t) => t.operator).filter(Boolean)))

    return NextResponse.json({
      kpis: {
        totalTasksMonth,
        avgDaysBetweenTasks,
        onTimePercent: overallOnTime,
        topOperator,
      },
      tasksPerDaySeries,
      tasksByOperator: Object.entries(operatorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      avgIntervalByType: [
        { type: "Fumigación", days: avgFumigation },
        { type: "Limpieza de filtros", days: avgFilter },
        { type: "Cambio de bombas", days: avgPump },
      ],
      detailData,
      uniqueOperators,
    })
  } catch (error: any) {
    console.error("Error analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
