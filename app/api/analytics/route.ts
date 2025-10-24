import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hotelsParam = searchParams.get("hotels") || searchParams.get("hotel")
  const days = searchParams.get("days")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const taskType = searchParams.get("taskType")
  const operator = searchParams.get("operator")

  if (!hotelsParam) {
    return NextResponse.json({ error: "Hotel parameter is required" }, { status: 400 })
  }

  const hotels = hotelsParam.split(",").map((h) => h.trim())

  const supabase = await createClient()

  try {
    const now = new Date()
    let monthStart: Date
    let monthEnd: Date

    if (days) {
      // Use days parameter (e.g., ?days=7, ?days=30, ?days=90)
      const daysNum = Number.parseInt(days, 10)
      monthEnd = new Date(now)
      monthStart = new Date(now)
      monthStart.setDate(monthStart.getDate() - daysNum)
    } else if (startDate && endDate) {
      // Use explicit date range
      monthStart = new Date(startDate)
      monthEnd = new Date(endDate)
    } else if (startDate) {
      // Use startDate with default 30 days
      monthStart = new Date(startDate)
      monthEnd = new Date(monthStart)
      monthEnd.setDate(monthEnd.getDate() + 30)
    } else {
      // Default to current month
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const daysDiff = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
    const groupBy = daysDiff <= 30 ? "day" : daysDiff <= 90 ? "week" : "month"

    const allHotelsData = await Promise.all(
      hotels.map(async (hotel) => {
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
            hotel,
          })),
          ...(filterCleanings.data || []).map((f) => ({
            type: "Limpieza de filtros",
            date: new Date(f.created_at),
            operator: f.operator_name,
            expectedInterval: 15,
            rooms: f.cleaned_filters,
            hotel,
          })),
          ...(pumpChanges.data || []).map((p) => ({
            type: "Cambio de bombas",
            date: new Date(p.date),
            operator: p.operator_name,
            expectedInterval: 7,
            rooms: p.pump_number,
            hotel,
          })),
        ]

        return { hotel, tasks: allTasks }
      }),
    )

    const allTasks = allHotelsData.flatMap((h) => h.tasks)

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

    const getGroupKey = (date: Date): string => {
      if (groupBy === "day") {
        return date.toISOString().split("T")[0]
      } else if (groupBy === "week") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split("T")[0]
      } else {
        // month
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }
    }

    const tasksPerGroupMap: Record<string, number> = {}
    filteredTasks.forEach((t) => {
      const key = getGroupKey(t.date)
      tasksPerGroupMap[key] = (tasksPerGroupMap[key] || 0) + 1
    })

    const tasksPerDaySeries = Object.keys(tasksPerGroupMap)
      .sort()
      .map((key) => ({ date: key, count: tasksPerGroupMap[key] }))

    const hotelComparison = allHotelsData.map((hd) => {
      const hotelTasks = hd.tasks
      return {
        hotel: hd.hotel,
        totalTasks: hotelTasks.length,
        avgInterval: hotelTasks.length > 1 ? calcAvgInterval(hotelTasks, hotelTasks[0].type) : 0,
      }
    })

    const detailData = [
      {
        type: "Fumigación",
        lastDate:
          filteredTasks
            .filter((t) => t.type === "Fumigación")
            .at(-1)
            ?.date.toISOString() || null,
        avgInterval: avgFumigation,
        totalMonth: filteredTasks.filter((t) => t.type === "Fumigación").length,
        onTimePercent: fumigationOnTime,
      },
      {
        type: "Limpieza de filtros",
        lastDate:
          filteredTasks
            .filter((t) => t.type === "Limpieza de filtros")
            .at(-1)
            ?.date.toISOString() || null,
        avgInterval: avgFilter,
        totalMonth: filteredTasks.filter((t) => t.type === "Limpieza de filtros").length,
        onTimePercent: filterOnTime,
      },
      {
        type: "Cambio de bombas",
        lastDate:
          filteredTasks
            .filter((t) => t.type === "Cambio de bombas")
            .at(-1)
            ?.date.toISOString() || null,
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
      hotelComparison,
      groupBy,
      dateRange: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString(),
        days: daysDiff,
      },
    })
  } catch (error: any) {
    console.error("Error analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
