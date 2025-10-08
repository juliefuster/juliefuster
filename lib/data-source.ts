import { createClient } from "./supabase/server"
import { mockDb } from "./mock-db"

console.log("[v0] data-source module loaded")

export const dataSource = {
  async getStats(hotel?: string) {
    console.log("[v0] dataSource.getStats called with hotel:", hotel)
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for stats")
        return mockDb.getStats(hotel)
      }

      // Get all tasks, optionally filtered by hotel
      let query = supabase.from("tasks").select("*")

      if (hotel) {
        // Filter by hotel in location field
        query = query.ilike("location", `%${hotel}%`)
      }

      const { data: tasks, error } = await query

      if (error) {
        console.error("[v0] Error fetching stats from Supabase:", error)
        return mockDb.getStats(hotel)
      }

      const total = tasks?.length || 0
      const pendiente = tasks?.filter((t) => t.status === "pendiente").length || 0
      const resuelta = tasks?.filter((t) => t.status === "resuelta").length || 0

      return { total, pendiente, resuelta }
    } catch (error) {
      console.error("[v0] Error in getStats:", error)
      return mockDb.getStats(hotel)
    }
  },

  async getAllIssues(hotel?: string) {
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for all issues")
        return mockDb.getAllIssues(hotel)
      }

      let query = supabase.from("tasks").select("*").order("created_at", { ascending: false })

      if (hotel) {
        query = query.ilike("location", `%${hotel}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching all issues:", error)
        return mockDb.getAllIssues(hotel)
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error in getAllIssues:", error)
      return mockDb.getAllIssues(hotel)
    }
  },

  async getPendingIssues(hotel?: string) {
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for pending issues")
        return mockDb.getPendingIssues(hotel)
      }

      let query = supabase.from("tasks").select("*").eq("status", "pendiente").order("created_at", { ascending: false })

      if (hotel) {
        query = query.ilike("location", `%${hotel}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching pending issues:", error)
        return mockDb.getPendingIssues(hotel)
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error in getPendingIssues:", error)
      return mockDb.getPendingIssues(hotel)
    }
  },

  async getResolvedIssues(hotel?: string) {
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for resolved issues")
        return mockDb.getResolvedIssues(hotel)
      }

      let query = supabase.from("tasks").select("*").eq("status", "resuelta").order("created_at", { ascending: false })

      if (hotel) {
        query = query.ilike("location", `%${hotel}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching resolved issues:", error)
        return mockDb.getResolvedIssues(hotel)
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error in getResolvedIssues:", error)
      return mockDb.getResolvedIssues(hotel)
    }
  },

  async createIssue(data: {
    title: string
    description: string | null
    category: string
    location: string
    priority: string
    reportedBy: string
    hotel?: string
  }) {
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for create issue")
        return mockDb.createIssue(data)
      }

      // Prepend hotel name to location if provided
      const fullLocation = data.hotel
        ? `Hotel ${data.hotel.charAt(0).toUpperCase() + data.hotel.slice(1)} - ${data.location}`
        : data.location

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          location: fullLocation,
          priority: data.priority,
          reported_by: data.reportedBy,
          status: "pendiente",
          user_id: null, // Set to null for now
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating issue:", error)
        return mockDb.createIssue(data)
      }

      return newTask
    } catch (error) {
      console.error("[v0] Error in createIssue:", error)
      return mockDb.createIssue(data)
    }
  },

  async updateIssueStatus(
    id: string | number,
    status: string,
    resolutionData?: {
      completionDate?: string
      responsible?: string
      repairDescription?: string
    },
  ) {
    try {
      const supabase = await createClient()

      if (!supabase) {
        console.log("[v0] Supabase not available, using mock data for update status")
        return mockDb.updateIssueStatus(Number(id), status, resolutionData)
      }

      // Update the task status
      const updateData: any = { status }

      // If resolution data is provided, append it to description
      if (resolutionData && status === "resuelta") {
        const { data: existingTask } = await supabase.from("tasks").select("description").eq("id", id).single()

        const resolutionNotes = `\n\n--- RESOLUCIÓN ---\nFecha: ${resolutionData.completionDate}\nResponsable: ${resolutionData.responsible}\nReparación: ${resolutionData.repairDescription}`

        updateData.description = (existingTask?.description || "") + resolutionNotes
      }

      const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("[v0] Error updating issue status:", error)
        return mockDb.updateIssueStatus(Number(id), status, resolutionData)
      }

      return data
    } catch (error) {
      console.error("[v0] Error in updateIssueStatus:", error)
      return mockDb.updateIssueStatus(Number(id), status, resolutionData)
    }
  },

  async getFilterCleaningRecords(hotel?: string) {
    return mockDb.getFilterCleaningRecords(hotel)
  },

  async createFilterCleaningRecord(data: {
    hotel: string
    cleanedFilters: string[]
    operatorName: string
    observations: string | null
  }) {
    return mockDb.createFilterCleaningRecord(data)
  },

  async getLastFilterCleaningDate(hotel: string) {
    return mockDb.getLastFilterCleaningDate(hotel)
  },

  async getPumpChangeRecords(hotel?: string) {
    return mockDb.getPumpChangeRecords(hotel)
  },

  async createPumpChangeRecord(data: {
    hotel: string
    pumpNumber: 1 | 2
    operatorName: string
    observations: string | null
  }) {
    return mockDb.createPumpChangeRecord(data)
  },

  async getLastPumpChangeDate(hotel: string) {
    return mockDb.getLastPumpChangeDate(hotel)
  },

  async getFumigationRecords(hotel?: string) {
    return mockDb.getFumigationRecords(hotel)
  },

  async createFumigationRecord(data: {
    hotel: string
    fumigatedRooms: string[]
    operatorName: string
    observations: string | null
  }) {
    return mockDb.createFumigationRecord(data)
  },

  async getLastFumigationDate(hotel: string, room?: string) {
    return mockDb.getLastFumigationDate(hotel, room)
  },

  async getFumigationStatus(hotel: string, rooms: string[]) {
    return mockDb.getFumigationStatus(hotel, rooms)
  },

  async getMonthlyTaskRecords(hotel?: string, taskId?: number) {
    return mockDb.getMonthlyTaskRecords(hotel, taskId)
  },

  async createMonthlyTaskRecord(data: {
    hotel: string
    taskId: number
    taskName: string
    operatorName: string
    observations: string | null
  }) {
    return mockDb.createMonthlyTaskRecord(data)
  },

  async getLastMonthlyTaskDate(hotel: string, taskId: number) {
    return mockDb.getLastMonthlyTaskDate(hotel, taskId)
  },

  async getMonthlyTasksStatus(hotel: string, tasks: { id: number; name: string }[]) {
    return mockDb.getMonthlyTasksStatus(hotel, tasks)
  },
}
