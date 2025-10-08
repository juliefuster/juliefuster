import { mockDb } from "./mock-db"

console.log("[v0] data-source module loaded")

// Data source abstraction layer
// Currently uses mock data, but can be extended to use Supabase or other backends
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
    try {
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
    try {
      return await mockDb.getLastPumpChangeDate(hotel)
    } catch (error) {
      console.error("[v0] Error in getLastPumpChangeDate:", error)
      return null
    }
  },

  // Fumigation methods
  getFumigationRecords: async (hotel?: string) => {
    try {
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
  }) => {
    try {
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
