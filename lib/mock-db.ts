type MaintenanceIssue = {
  id: number
  title: string
  description: string | null
  category: string
  location: string
  priority: string
  status: string
  reported_by: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  hotel?: string
  completion_date?: string | null
  responsible?: string | null
  repair_description?: string | null
}

// In-memory storage
const issues: MaintenanceIssue[] = [
  {
    id: 1,
    title: "Aire acondicionado no funciona",
    description: "El aire acondicionado de la habitación 305 no enciende",
    category: "climatizacion",
    location: "Habitación 305",
    priority: "alta",
    status: "pendiente",
    reported_by: "Recepción",
    assigned_to: null,
    hotel: "caledonian",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 2,
    title: "Fuga de agua en baño",
    description: "Hay una pequeña fuga debajo del lavabo",
    category: "fontaneria",
    location: "Habitación 412",
    priority: "urgente",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: "Juan Pérez",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 3,
    title: "Bombilla fundida",
    description: "La luz del pasillo del tercer piso no funciona",
    category: "electricidad",
    location: "Pasillo 3er piso",
    priority: "media",
    status: "resuelta",
    reported_by: "Mantenimiento",
    assigned_to: "Carlos López",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    completion_date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    responsible: "Carlos López",
    repair_description: "Se cambió la bombilla",
  },
  {
    id: 4,
    title: "Puerta de habitación no cierra bien",
    description: "La cerradura de la habitación 201 está atascada",
    category: "mobiliario",
    location: "Habitación 201",
    priority: "alta",
    status: "pendiente",
    reported_by: "Recepción",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 5,
    title: "Televisor no enciende",
    description: "El televisor de la habitación 508 no responde al control remoto",
    category: "electricidad",
    location: "Habitación 508",
    priority: "media",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 6,
    title: "Mancha en alfombra del lobby",
    description: "Hay una mancha grande en la alfombra cerca de la entrada principal",
    category: "limpieza",
    location: "Lobby",
    priority: "baja",
    status: "pendiente",
    reported_by: "Gerencia",
    assigned_to: "María García",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 7,
    title: "Calefacción muy alta",
    description: "La temperatura en la habitación 610 es demasiado alta y no se puede regular",
    category: "climatizacion",
    location: "Habitación 610",
    priority: "media",
    status: "resuelta",
    reported_by: "Huésped",
    assigned_to: "Pedro Martínez",
    hotel: "chi",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    completion_date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    responsible: "Pedro Martínez",
    repair_description: "Se ajustó la calefacción",
  },
  {
    id: 8,
    title: "Grifo gotea constantemente",
    description: "El grifo del lavabo en la habitación 315 gotea sin parar",
    category: "fontaneria",
    location: "Habitación 315",
    priority: "media",
    status: "resuelta",
    reported_by: "Limpieza",
    assigned_to: "Juan Pérez",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    completion_date: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    responsible: "Juan Pérez",
    repair_description: "Se reparó el grifo",
  },
  {
    id: 9,
    title: "Silla rota en restaurante",
    description: "Una de las sillas del restaurante tiene una pata suelta",
    category: "mobiliario",
    location: "Restaurante",
    priority: "urgente",
    status: "pendiente",
    reported_by: "Restaurante",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 10,
    title: "Ventana no cierra correctamente",
    description: "La ventana de la habitación 720 no cierra bien y entra aire frío",
    category: "otros",
    location: "Habitación 720",
    priority: "alta",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: "Carlos López",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 11,
    title: "Ducha con poca presión de agua",
    description: "La ducha de la habitación 425 tiene muy poca presión de agua",
    category: "fontaneria",
    location: "Habitación 425",
    priority: "media",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: null,
    hotel: "caledonian",
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 12,
    title: "Enchufe no funciona",
    description: "El enchufe junto a la cama en habitación 530 no tiene corriente",
    category: "electricidad",
    location: "Habitación 530",
    priority: "alta",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 13,
    title: "Cortinas rotas",
    description: "Las cortinas de la habitación 218 están descolgadas de un lado",
    category: "mobiliario",
    location: "Habitación 218",
    priority: "baja",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 14,
    title: "Ruido extraño en el aire acondicionado",
    description: "El aire acondicionado de la habitación 615 hace un ruido muy fuerte",
    category: "climatizacion",
    location: "Habitación 615",
    priority: "media",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: "Pedro Martínez",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 15,
    title: "Caja fuerte no abre",
    description: "La caja fuerte de la habitación 340 no responde al código",
    category: "otros",
    location: "Habitación 340",
    priority: "urgente",
    status: "pendiente",
    reported_by: "Recepción",
    assigned_to: null,
    hotel: "caledonian",
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 16,
    title: "Espejo del baño despegado",
    description: "El espejo del baño en habitación 445 está despegándose de la pared",
    category: "mobiliario",
    location: "Habitación 445",
    priority: "alta",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: "Carlos López",
    hotel: "chi",
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 17,
    title: "Luz del baño parpadea",
    description: "La luz del baño en habitación 512 parpadea constantemente",
    category: "electricidad",
    location: "Habitación 512",
    priority: "media",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 18,
    title: "Inodoro con fuga",
    description: "El inodoro de la habitación 228 pierde agua por la base",
    category: "fontaneria",
    location: "Habitación 228",
    priority: "urgente",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: "Juan Pérez",
    hotel: "caledonian",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 19,
    title: "Minibar no enfría",
    description: "El minibar de la habitación 635 no está enfriando las bebidas",
    category: "otros",
    location: "Habitación 635",
    priority: "baja",
    status: "pendiente",
    reported_by: "Huésped",
    assigned_to: null,
    hotel: "chi",
    created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 20,
    title: "Mancha de humedad en techo",
    description: "Hay una mancha de humedad en el techo de la habitación 710",
    category: "otros",
    location: "Habitación 710",
    priority: "alta",
    status: "pendiente",
    reported_by: "Limpieza",
    assigned_to: null,
    hotel: "caledonian",
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
]

let nextId = 21

type FilterCleaningRecord = {
  id: number
  hotel: string
  cleanedFilters: string[]
  operatorName: string
  observations: string | null
  cleanedAt: string
}

type PumpChangeRecord = {
  id: number
  hotel: string
  pumpNumber: 1 | 2
  operatorName: string
  observations: string | null
  changedAt: string
}

const filterCleaningRecords: FilterCleaningRecord[] = [
  {
    id: 1,
    hotel: "caledonian",
    cleanedFilters: ["101", "102", "103", "Cocina", "Recepción"],
    operatorName: "Juan Pérez",
    observations: "Filtros muy sucios, se recomienda limpieza más frecuente",
    cleanedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    hotel: "caledonian",
    cleanedFilters: ["201", "202", "203", "204", "Desayunos"],
    operatorName: "María García",
    observations: null,
    cleanedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

let nextFilterCleaningId = 3

const pumpChangeRecords: PumpChangeRecord[] = [
  {
    id: 1,
    hotel: "caledonian",
    pumpNumber: 1,
    operatorName: "Pedro Martínez",
    observations: "Cambio rutinario semanal",
    changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

let nextPumpChangeId = 2

type FumigationRecord = {
  id: number
  hotel: string
  fumigatedRooms: string[]
  operatorName: string
  observations: string | null
  fumigatedAt: string
}

const fumigationRecords: FumigationRecord[] = [
  {
    id: 1,
    hotel: "caledonian",
    fumigatedRooms: ["101", "102", "103", "104", "105"],
    operatorName: "Control de Plagas S.L.",
    observations: "Fumigación preventiva trimestral",
    fumigatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

let nextFumigationId = 2

type MonthlyTaskRecord = {
  id: number
  hotel: string
  taskId: number
  taskName: string
  operatorName: string
  observations: string | null
  completedAt: string
}

const monthlyTaskRecords: MonthlyTaskRecord[] = [
  {
    id: 1,
    hotel: "caledonian",
    taskId: 5,
    taskName: "Limpieza marquesina",
    operatorName: "Juan Pérez",
    observations: "Limpieza completa realizada",
    completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

let nextMonthlyTaskId = 2

console.log("[v0] mock-db module loaded")

export const mockDb = {
  // Get all issues
  getAllIssues: async (hotel?: string): Promise<MaintenanceIssue[]> => {
    if (hotel) {
      return issues.filter((issue) => issue.hotel === hotel)
    }
    return [...issues]
  },

  // Get pending issues
  getPendingIssues: async (hotel?: string): Promise<MaintenanceIssue[]> => {
    let filtered = issues.filter((issue) => issue.status === "pendiente")
    if (hotel) {
      filtered = filtered.filter((issue) => issue.hotel === hotel)
    }
    return filtered.sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgente: 1, alta: 2, media: 3, baja: 4 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  },

  // Get resolved issues
  getResolvedIssues: async (hotel?: string): Promise<MaintenanceIssue[]> => {
    let filtered = issues.filter((issue) => issue.status === "resuelta")
    if (hotel) {
      filtered = filtered.filter((issue) => issue.hotel === hotel)
    }
    return filtered.sort((a, b) => {
      const aTime = a.resolved_at ? new Date(a.resolved_at).getTime() : 0
      const bTime = b.resolved_at ? new Date(b.resolved_at).getTime() : 0
      return bTime - aTime
    })
  },

  // Get stats
  getStats: async (hotel?: string) => {
    console.log("[v0] mockDb.getStats called with hotel:", hotel)
    let filtered = issues
    if (hotel) {
      filtered = issues.filter((issue) => issue.hotel === hotel)
    }
    const total = filtered.length
    const pending = filtered.filter((i) => i.status === "pendiente").length
    const resolved = filtered.filter((i) => i.status === "resuelta").length

    return { total, pending, resolved }
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
  }): Promise<{ id: number }> => {
    const newIssue: MaintenanceIssue = {
      id: nextId++,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      priority: data.priority,
      status: "pendiente",
      reported_by: data.reportedBy,
      assigned_to: null,
      hotel: data.hotel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
    }

    issues.push(newIssue)
    return { id: newIssue.id }
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
  ): Promise<void> => {
    const issue = issues.find((i) => i.id === id)
    if (issue) {
      issue.status = status
      issue.updated_at = new Date().toISOString()
      if (status === "resuelta") {
        issue.resolved_at = new Date().toISOString()
        if (resolutionData) {
          issue.completion_date = resolutionData.completionDate || null
          issue.responsible = resolutionData.responsible || null
          issue.repair_description = resolutionData.repairDescription || null
        }
      }
    }
  },

  // Get all filter cleaning records
  getFilterCleaningRecords: async (hotel?: string): Promise<FilterCleaningRecord[]> => {
    let filtered = filterCleaningRecords
    if (hotel) {
      filtered = filterCleaningRecords.filter((record) => record.hotel === hotel)
    }
    return filtered.sort((a, b) => new Date(b.cleanedAt).getTime() - new Date(a.cleanedAt).getTime())
  },

  // Create filter cleaning record
  createFilterCleaningRecord: async (data: {
    hotel: string
    cleanedFilters: string[]
    operatorName: string
    observations: string | null
  }): Promise<{ id: number }> => {
    const newRecord: FilterCleaningRecord = {
      id: nextFilterCleaningId++,
      hotel: data.hotel,
      cleanedFilters: data.cleanedFilters,
      operatorName: data.operatorName,
      observations: data.observations,
      cleanedAt: new Date().toISOString(),
    }

    filterCleaningRecords.push(newRecord)
    return { id: newRecord.id }
  },

  // Get last filter cleaning date for a hotel
  getLastFilterCleaningDate: async (hotel: string): Promise<string | null> => {
    const hotelRecords = filterCleaningRecords.filter((record) => record.hotel === hotel)
    if (hotelRecords.length === 0) return null

    const lastRecord = hotelRecords.sort((a, b) => new Date(b.cleanedAt).getTime() - new Date(a.cleanedAt).getTime())[0]
    return lastRecord.cleanedAt
  },

  // Get all pump change records
  getPumpChangeRecords: async (hotel?: string): Promise<PumpChangeRecord[]> => {
    let filtered = pumpChangeRecords
    if (hotel) {
      filtered = pumpChangeRecords.filter((record) => record.hotel === hotel)
    }
    return filtered.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
  },

  // Create pump change record
  createPumpChangeRecord: async (data: {
    hotel: string
    pumpNumber: 1 | 2
    operatorName: string
    observations: string | null
  }): Promise<{ id: number }> => {
    const newRecord: PumpChangeRecord = {
      id: nextPumpChangeId++,
      hotel: data.hotel,
      pumpNumber: data.pumpNumber,
      operatorName: data.operatorName,
      observations: data.observations,
      changedAt: new Date().toISOString(),
    }

    pumpChangeRecords.push(newRecord)
    return { id: newRecord.id }
  },

  // Get last pump change date for a hotel
  getLastPumpChangeDate: async (hotel: string): Promise<string | null> => {
    const hotelRecords = pumpChangeRecords.filter((record) => record.hotel === hotel)
    if (hotelRecords.length === 0) return null

    const lastRecord = hotelRecords.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0]
    return lastRecord.changedAt
  },

  // Get all fumigation records
  getFumigationRecords: async (hotel?: string): Promise<FumigationRecord[]> => {
    let filtered = fumigationRecords
    if (hotel) {
      filtered = fumigationRecords.filter((record) => record.hotel === hotel)
    }
    return filtered.sort((a, b) => new Date(b.fumigatedAt).getTime() - new Date(a.fumigatedAt).getTime())
  },

  // Create fumigation record
  createFumigationRecord: async (data: {
    hotel: string
    fumigatedRooms: string[]
    operatorName: string
    observations: string | null
  }): Promise<{ id: number }> => {
    const newRecord: FumigationRecord = {
      id: nextFumigationId++,
      hotel: data.hotel,
      fumigatedRooms: data.fumigatedRooms,
      operatorName: data.operatorName,
      observations: data.observations,
      fumigatedAt: new Date().toISOString(),
    }

    fumigationRecords.push(newRecord)
    return { id: newRecord.id }
  },

  // Get last fumigation date for a hotel
  getLastFumigationDate: async (hotel: string): Promise<{ date: string; next_date: string } | null> => {
    const hotelRecords = fumigationRecords.filter((record) => record.hotel === hotel)
    if (hotelRecords.length === 0) return null

    const lastRecord = hotelRecords.sort(
      (a, b) => new Date(b.fumigatedAt).getTime() - new Date(a.fumigatedAt).getTime(),
    )[0]

    const fumigationDate = new Date(lastRecord.fumigatedAt)
    const nextDate = new Date(fumigationDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

    return {
      date: fumigationDate.toISOString().split("T")[0],
      next_date: nextDate.toISOString().split("T")[0],
    }
  },

  // Get fumigation status for all rooms
  getFumigationStatus: async (hotel: string, rooms: string[]) => {
    const roomStatus = await Promise.all(
      rooms.map(async (room) => {
        const lastDate = await mockDb.getLastFumigationDate(hotel)
        if (!lastDate) {
          return { room, status: "overdue", lastFumigation: null, nextDue: null }
        }

        const lastFumigation = new Date(lastDate.date)
        const nextDue = new Date(lastFumigation.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
        const now = new Date()
        const daysUntilDue = Math.floor((nextDue.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

        let status: "upToDate" | "upcoming" | "overdue"
        if (daysUntilDue < 0) {
          status = "overdue"
        } else if (daysUntilDue <= 14) {
          status = "upcoming"
        } else {
          status = "upToDate"
        }

        return {
          room,
          status,
          lastFumigation: lastDate.date,
          nextDue: lastDate.next_date,
          daysUntilDue,
        }
      }),
    )

    return roomStatus
  },

  // Get all monthly task records
  getMonthlyTaskRecords: async (hotel?: string, taskId?: number): Promise<MonthlyTaskRecord[]> => {
    let filtered = monthlyTaskRecords
    if (hotel) {
      filtered = filtered.filter((record) => record.hotel === hotel)
    }
    if (taskId) {
      filtered = filtered.filter((record) => record.taskId === taskId)
    }
    return filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  },

  // Create monthly task record
  createMonthlyTaskRecord: async (data: {
    hotel: string
    taskId: number
    taskName: string
    operatorName: string
    observations: string | null
  }): Promise<{ id: number }> => {
    const newRecord: MonthlyTaskRecord = {
      id: nextMonthlyTaskId++,
      hotel: data.hotel,
      taskId: data.taskId,
      taskName: data.taskName,
      operatorName: data.operatorName,
      observations: data.observations,
      completedAt: new Date().toISOString(),
    }

    monthlyTaskRecords.push(newRecord)
    return { id: newRecord.id }
  },

  // Get last completion date for a monthly task
  getLastMonthlyTaskDate: async (hotel: string, taskId: number): Promise<string | null> => {
    const taskRecords = monthlyTaskRecords.filter((record) => record.hotel === hotel && record.taskId === taskId)
    if (taskRecords.length === 0) return null

    const lastRecord = taskRecords.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )[0]
    return lastRecord.completedAt
  },

  // Get status for all monthly tasks
  getMonthlyTasksStatus: async (hotel: string, tasks: { id: number; name: string }[]) => {
    const taskStatus = await Promise.all(
      tasks.map(async (task) => {
        const lastDate = await mockDb.getLastMonthlyTaskDate(hotel, task.id)
        if (!lastDate) {
          return { taskId: task.id, taskName: task.name, status: "overdue", lastCompletion: null, nextDue: null }
        }

        const lastCompletion = new Date(lastDate)
        const nextDue = new Date(lastCompletion.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
        const now = new Date()
        const daysUntilDue = Math.floor((nextDue.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

        let status: "upToDate" | "upcoming" | "overdue"
        if (daysUntilDue < 0) {
          status = "overdue"
        } else if (daysUntilDue <= 7) {
          status = "upcoming"
        } else {
          status = "upToDate"
        }

        return {
          taskId: task.id,
          taskName: task.name,
          status,
          lastCompletion: lastDate,
          nextDue: nextDue.toISOString(),
          daysUntilDue,
        }
      }),
    )

    return taskStatus
  },
}
