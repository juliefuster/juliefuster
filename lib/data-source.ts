import { mockDb } from "./mock-db"
import { createServerClient } from "./supabase/server"

console.log("[v0] data-source module loaded")

const getSupabaseClient = () => {
  try {
    return createServerClient()
  } catch (error) {
    console.error("[v0] Error creating Supabase client:", error)
    return null
  }
}

// Data source abstraction layer
export const dataSource = {
  // Get all issues
  getAllIssues: async (hotel?: string) => {
    console.log("[v0] dataSource.getAllIssues called with hotel:", hotel)
    try {
      return await mockDb.getAllIssues(hotel)
    } catch (error) {
      console.error("[v0] Error in getAllIssues:", error)
      return []
    }
  },

  // Get pending issues
  getPendingIssues: async (hotel?: string) => {
    console.log("[v0] dataSource.getPendingIssues called with hotel:", hotel)
    try {
      return await mockDb.getPendingIssues(hotel)
    } catch (error) {
      console.error("[v0] Error in getPendingIssues:", error)
      return []
    }
  },

  // Get resolved issues
  getResolvedIssues: async (hotel?: string) => {
    console.log("[v0] dataSource.getResolvedIssues called with hotel:", hotel)
    try {
      return await mockDb.getResolvedIssues(hotel)
    } catch (error) {
      console.error("[v0] Error in getResolvedIssues:", error)
      return []
    }
  },

  // Get stats
  getStats: async (hotel?: string) => {
    console.log("[v0] dataSource.getStats called with hotel:", hotel)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        let query = supabase.from("maintenance_tasks").select("status", { count: "exact" })

        if (hotel) {
          query = query.eq("hotel", hotel)
        }

        const { count: total, error: totalError } = await query

        if (totalError) {
          console.error("[v0] Supabase error getting total count:", totalError)
          return await mockDb.getStats(hotel)
        }

        // Get pending count
        let pendingQuery = supabase
          .from("maintenance_tasks")
          .select("status", { count: "exact" })
          .eq("status", "pendiente")
        if (hotel) {
          pendingQuery = pendingQuery.eq("hotel", hotel)
        }
        const { count: pending, error: pendingError } = await pendingQuery

        if (pendingError) {
          console.error("[v0] Supabase error getting pending count:", pendingError)
          return await mockDb.getStats(hotel)
        }

        // Get resolved count
        let resolvedQuery = supabase
          .from("maintenance_tasks")
          .select("status", { count: "exact" })
          .eq("status", "resuelto")
        if (hotel) {
          resolvedQuery = resolvedQuery.eq("hotel", hotel)
        }
        const { count: resolved, error: resolvedError } = await resolvedQuery

        if (resolvedError) {
          console.error("[v0] Supabase error getting resolved count:", resolvedError)
          return await mockDb.getStats(hotel)
        }

        const stats = {
          total: total || 0,
          pending: pending || 0,
          resolved: resolved || 0,
        }
        console.log("[v0] dataSource.getStats returning from Supabase:", stats)
        return stats
      }

      const stats = await mockDb.getStats(hotel)
      console.log("[v0] dataSource.getStats returning:", stats)
      return stats
    } catch (error) {
      console.error("[v0] Error in getStats:", error)
      return { total: 0, pending: 0, resolved: 0 }
    }
  },

  // Create new issue
  createIssue: async (data: {
    title: string
    description: string | null
    category: string
    location: string
    priority: string
    reportedBy: string
    hotel?: string
  }) => {
    console.log("[v0] dataSource.createIssue called with data:", data)
    try {
      return await mockDb.createIssue(data)
    } catch (error) {
      console.error("[v0] Error in createIssue:", error)
      throw error
    }
  },

  // Update issue status
  updateIssueStatus: async (
    id: number,
    status: string,
    resolutionData?: {
      completionDate?: string
      responsible?: string
      repairDescription?: string
    },
  ) => {
    console.log("[v0] dataSource.updateIssueStatus called with id:", id, "status:", status)
    try {
      return await mockDb.updateIssueStatus(id, status, resolutionData)
    } catch (error) {
      console.error("[v0] Error in updateIssueStatus:", error)
      throw error
    }
  },

  // Filter cleaning methods
  getFilterCleaningRecords: async (hotel?: string) => {
    try {
      return await mockDb.getFilterCleaningRecords(hotel)
    } catch (error) {
      console.error("[v0] Error in getFilterCleaningRecords:", error)
      return []
    }
  },

  createFilterCleaningRecord: async (data: {
    hotel: string
    cleanedFilters: string[]
    operatorName: string
    observations: string | null
  }) => {
    try {
      return await mockDb.createFilterCleaningRecord(data)
    } catch (error) {
      console.error("[v0] Error in createFilterCleaningRecord:", error)
      throw error
    }
  },

  getLastFilterCleaningDate: async (hotel: string) => {
    try {
      return await mockDb.getLastFilterCleaningDate(hotel)
    } catch (error) {
      console.error("[v0] Error in getLastFilterCleaningDate:", error)
      return null
    }
  },

  // Pump change methods
  getPumpChangeRecords: async (hotel?: string) => {
    console.log("[v0] dataSource.getPumpChangeRecords called with hotel:", hotel)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        let query = supabase.from("pump_change_records").select("*").order("date", { ascending: false })

        if (hotel) {
          query = query.eq("hotel", hotel)
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Supabase error in getPumpChangeRecords:", error)
          return await mockDb.getPumpChangeRecords(hotel)
        }

        return data || []
      }
      return await mockDb.getPumpChangeRecords(hotel)
    } catch (error) {
      console.error("[v0] Error in getPumpChangeRecords:", error)
      return []
    }
  },

  createPumpChangeRecord: async (data: {
    hotel: string
    pumpNumber: 1 | 2
    operatorName: string
    observations: string | null
  }) => {
    try {
      return await mockDb.createPumpChangeRecord(data)
    } catch (error) {
      console.error("[v0] Error in createPumpChangeRecord:", error)
      throw error
    }
  },

  getLastPumpChangeDate: async (hotel: string) => {
    console.log("[v0] dataSource.getLastPumpChangeDate called with hotel:", hotel)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("pump_change_records")
          .select("date, pump_number, operator_name")
          .eq("hotel", hotel)
          .order("date", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("[v0] Supabase error in getLastPumpChangeDate:", error)
          return await mockDb.getLastPumpChangeDate(hotel)
        }

        return data
      }
      return await mockDb.getLastPumpChangeDate(hotel)
    } catch (error) {
      console.error("[v0] Error in getLastPumpChangeDate:", error)
      return null
    }
  },

  // Fumigation methods
  getFumigationRecords: async (hotel?: string) => {
    console.log("[v0] dataSource.getFumigationRecords called with hotel:", hotel)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        let query = supabase.from("fumigation_records").select("*").order("date", { ascending: false })

        if (hotel) {
          query = query.eq("hotel", hotel)
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Supabase error in getFumigationRecords:", error)
          return await mockDb.getFumigationRecords(hotel)
        }

        return data || []
      }
      return await mockDb.getFumigationRecords(hotel)
    } catch (error) {
      console.error("[v0] Error in getFumigationRecords:", error)
      return []
    }
  },

  createFumigationRecord: async (data: {
    hotel: string
    fumigatedRooms: string[]
    operatorName: string
    observations: string | null
    date?: string
  }) => {
    console.log("[v0] dataSource.createFumigationRecord called with data:", data)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const fumigationDate = data.date || new Date().toISOString().split("T")[0]
        const nextDate = new Date(fumigationDate)
        nextDate.setDate(nextDate.getDate() + 90) // 3 months = 90 days

        const { data: result, error } = await supabase
          .from("fumigation_records")
          .insert([
            {
              hotel: data.hotel,
              date: fumigationDate,
              next_date: nextDate.toISOString().split("T")[0],
              operator_name: data.operatorName,
              observations: data.observations,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("[v0] Supabase error in createFumigationRecord:", error)
          return await mockDb.createFumigationRecord(data)
        }

        return result
      }
      return await mockDb.createFumigationRecord(data)
    } catch (error) {
      console.error("[v0] Error in createFumigationRecord:", error)
      throw error
    }
  },

  getFumigationStatus: async (hotel: string, rooms: string[]) => {
    try {
      return await mockDb.getFumigationStatus(hotel, rooms)
    } catch (error) {
      console.error("[v0] Error in getFumigationStatus:", error)
      return []
    }
  },

  getLastFumigationDate: async (hotel: string) => {
    console.log("[v0] dataSource.getLastFumigationDate called with hotel:", hotel)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("fumigation_records")
          .select("date, next_date")
          .eq("hotel", hotel)
          .order("date", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("[v0] Supabase error in getLastFumigationDate:", error)
          return await mockDb.getLastFumigationDate(hotel)
        }

        return data
      }
      return await mockDb.getLastFumigationDate(hotel)
    } catch (error) {
      console.error("[v0] Error in getLastFumigationDate:", error)
      return null
    }
  },

  // Monthly tasks methods
  getMonthlyTaskRecords: async (hotel?: string, taskId?: number) => {
    try {
      return await mockDb.getMonthlyTaskRecords(hotel, taskId)
    } catch (error) {
      console.error("[v0] Error in getMonthlyTaskRecords:", error)
      return []
    }
  },

  createMonthlyTaskRecord: async (data: {
    hotel: string
    taskId: number
    taskName: string
    operatorName: string
    observations: string | null
  }) => {
    try {
      return await mockDb.createMonthlyTaskRecord(data)
    } catch (error) {
      console.error("[v0] Error in createMonthlyTaskRecord:", error)
      throw error
    }
  },

  getMonthlyTasksStatus: async (hotel: string, tasks: { id: number; name: string }[]) => {
    try {
      return await mockDb.getMonthlyTasksStatus(hotel, tasks)
    } catch (error) {
      console.error("[v0] Error in getMonthlyTasksStatus:", error)
      return []
    }
  },
}
