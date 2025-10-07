import { mockDb } from "./mock-db"

console.log("[v0] data-source module loaded")

export const dataSource = {
  async getStats(hotel?: string) {
    console.log("[v0] dataSource.getStats called with hotel:", hotel)
    return mockDb.getStats(hotel)
  },

  async getAllIssues(hotel?: string) {
    return mockDb.getAllIssues(hotel)
  },

  async getPendingIssues(hotel?: string) {
    return mockDb.getPendingIssues(hotel)
  },

  async getResolvedIssues(hotel?: string) {
    return mockDb.getResolvedIssues(hotel)
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
    return mockDb.createIssue(data)
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
    return mockDb.updateIssueStatus(Number(id), status, resolutionData)
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
