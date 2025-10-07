"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Wrench, History } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type PreventiveTask = {
  id: number
  title: string
  frequency: string
  icon: string
  category: string
  lastCompleted?: string
  nextDue: string
  status: "pending" | "completed" | "overdue"
}

export default function PreventiveMaintenance() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const [tasks] = useState<PreventiveTask[]>([
    // Semanal
    {
      id: 1,
      title: "Cambio de bombas",
      frequency: "Semanal",
      icon: "🔄",
      category: "weekly",
      nextDue: "2025-10-14",
      status: "pending",
    },
    {
      id: 2,
      title: "Revisión de desagües",
      frequency: "Semanal",
      icon: "🚰",
      category: "weekly",
      nextDue: "2025-10-14",
      status: "pending",
    },
    // Quincenal
    {
      id: 3,
      title: "Limpieza filtros de aire",
      frequency: "Quincenal (15 días)",
      icon: "🌬️",
      category: "biweekly",
      nextDue: "2025-10-21",
      status: "pending",
    },
    {
      id: 4,
      title: "Revisión de desagües",
      frequency: "Quincenal (15 días)",
      icon: "🚰",
      category: "biweekly",
      nextDue: "2025-10-21",
      status: "pending",
    },
    // Mensual
    {
      id: 5,
      title: "Limpieza marquesina",
      frequency: "Mensual",
      icon: "🧽",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    {
      id: 6,
      title: "Limpieza sala de máquinas",
      frequency: "Mensual",
      icon: "🏭",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    {
      id: 7,
      title: "Revisión luces de emergencia",
      frequency: "Mensual",
      icon: "💡",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    {
      id: 8,
      title: "Limpieza bajante S1",
      frequency: "Mensual",
      icon: "⬇️",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    {
      id: 9,
      title: "Limpieza pozo S2",
      frequency: "Mensual",
      icon: "💧",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    {
      id: 10,
      title: "Revisión ascensor y montacargas",
      frequency: "Mensual (externo)",
      icon: "🛗",
      category: "monthly",
      nextDue: "2025-11-01",
      status: "pending",
    },
    // Cada 2 meses
    {
      id: 11,
      title: "Mover llaves de paso de todo el hotel",
      frequency: "Cada 2 meses",
      icon: "🔑",
      category: "bimonthly",
      nextDue: "2025-12-01",
      status: "pending",
    },
    // Trimestral
    {
      id: 12,
      title: "Fumigación de chinches",
      frequency: "Trimestral (3 meses)",
      icon: "🪳",
      category: "quarterly",
      nextDue: "2026-01-01",
      status: "pending",
    },
    {
      id: 13,
      title: "Limpieza filtros caldera (bomba roja)",
      frequency: "Trimestral (3 meses)",
      icon: "🔴",
      category: "quarterly",
      nextDue: "2026-01-01",
      status: "pending",
    },
    {
      id: 14,
      title: "Control de plagas",
      frequency: "Cada 3-4 meses (externo)",
      icon: "🪳",
      category: "quarterly",
      nextDue: "2026-01-15",
      status: "pending",
    },
    // Anual
    {
      id: 15,
      title: "Revisión aire acondicionado",
      frequency: "Anual (externo)",
      icon: "❄️",
      category: "annual",
      nextDue: "2026-07-01",
      status: "pending",
    },
    {
      id: 16,
      title: "Grupo electrógeno",
      frequency: "Anual (externo)",
      icon: "⚡",
      category: "annual",
      nextDue: "2026-07-01",
      status: "pending",
    },
    {
      id: 17,
      title: "Alarma y extintores",
      frequency: "Anual (externo)",
      icon: "🔔🔥",
      category: "annual",
      nextDue: "2026-07-01",
      status: "pending",
    },
    {
      id: 18,
      title: "Control legionela",
      frequency: "Anual (externo)",
      icon: "💧",
      category: "annual",
      nextDue: "2026-07-01",
      status: "pending",
    },
  ])

  const categories = [
    { id: "weekly", name: "Semanal", color: "bg-red-100 text-red-800 border-red-200" },
    { id: "biweekly", name: "Quincenal", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { id: "monthly", name: "Mensual", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { id: "bimonthly", name: "Cada 2 meses", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { id: "quarterly", name: "Trimestral", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { id: "annual", name: "Anual", color: "bg-slate-100 text-slate-800 border-slate-200" },
  ]

  const filterLocations = {
    rooms: [
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "212",
      "214",
      "215",
      "216",
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "401",
      "402",
      "403",
      "404",
      "405",
      "406",
      "407",
      "408",
      "501",
      "502",
      "503",
      "504",
      "505",
      "506",
      "507",
      "508",
      "601",
      "602",
      "603",
      "604",
      "605",
      "606",
      "607",
      "608",
      "609",
      "610",
      "611",
      "612",
    ],
    commonAreas: ["Baños extractores", "Cocina", "Desayunos", "Rack", "Recepción"],
  }

  const fumigationRooms = [
    "101",
    "102",
    "103",
    "104",
    "105",
    "106",
    "107",
    "108",
    "202",
    "203",
    "204",
    "205",
    "206",
    "207",
    "208",
    "209",
    "210",
    "212",
    "214",
    "215",
    "216",
    "301",
    "302",
    "303",
    "304",
    "305",
    "306",
    "307",
    "308",
    "401",
    "402",
    "403",
    "404",
    "405",
    "406",
    "407",
    "408",
    "501",
    "502",
    "503",
    "504",
    "505",
    "506",
    "507",
    "508",
    "601",
    "602",
    "603",
    "604",
    "605",
    "606",
    "607",
    "608",
    "609",
    "610",
    "611",
    "612",
  ]

  const [showPumpDialog, setShowPumpDialog] = useState(false)
  const [selectedPump, setSelectedPump] = useState<1 | 2 | null>(null)
  const [pumpOperatorName, setPumpOperatorName] = useState("")
  const [pumpObservations, setPumpObservations] = useState("")
  const [lastPumpChangeDate, setLastPumpChangeDate] = useState<string | null>(null)

  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filterChecklist, setFilterChecklist] = useState<Record<string, boolean>>({})
  const [operatorName, setOperatorName] = useState("")
  const [observations, setObservations] = useState("")
  const [lastCleaningDate, setLastCleaningDate] = useState<string | null>(null)
  const [nextDueDate, setNextDueDate] = useState<string | null>(null)

  const [showFumigationDialog, setShowFumigationDialog] = useState(false)
  const [fumigationChecklist, setFumigationChecklist] = useState<Record<string, boolean>>({})
  const [fumigationOperatorName, setFumigationOperatorName] = useState("")
  const [fumigationObservations, setFumigationObservations] = useState("")
  const [fumigationStatus, setFumigationStatus] = useState<any[]>([])

  useEffect(() => {
    fetchLastCleaningDate()
    fetchLastPumpChangeDate()
    fetchFumigationStatus()
  }, [hotel])

  const fetchLastCleaningDate = async () => {
    try {
      const response = await fetch(`/api/filter-cleaning/last-date?hotel=${hotel}`)
      const data = await response.json()
      if (data.lastDate) {
        setLastCleaningDate(data.lastDate)
        const lastDate = new Date(data.lastDate)
        const nextDate = new Date(lastDate)
        nextDate.setDate(nextDate.getDate() + 15)
        setNextDueDate(nextDate.toISOString())
      }
    } catch (error) {
      console.error("Error fetching last cleaning date:", error)
    }
  }

  const fetchLastPumpChangeDate = async () => {
    try {
      const response = await fetch(`/api/pump-change/last-date?hotel=${hotel}`)
      const data = await response.json()
      if (data.lastDate) {
        setLastPumpChangeDate(data.lastDate)
      }
    } catch (error) {
      console.error("Error fetching last pump change date:", error)
    }
  }

  const fetchFumigationStatus = async () => {
    try {
      const response = await fetch(`/api/fumigation/status?hotel=${hotel}&rooms=${fumigationRooms.join(",")}`)
      const data = await response.json()
      setFumigationStatus(data)
    } catch (error) {
      console.error("Error fetching fumigation status:", error)
    }
  }

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter((task) => task.category === categoryId)
  }

  const handleCompleteTask = (taskId: number) => {
    if (taskId === 1) {
      setShowPumpDialog(true)
      setSelectedPump(null)
      setPumpOperatorName("")
      setPumpObservations("")
    } else if (taskId === 3) {
      setShowFilterDialog(true)
      setFilterChecklist({})
      setOperatorName("")
      setObservations("")
    } else if (taskId === 12) {
      setShowFumigationDialog(true)
      setFumigationChecklist({})
      setFumigationOperatorName("")
      setFumigationObservations("")
    } else {
      console.log("Completing task:", taskId)
    }
  }

  const toggleFilter = (location: string) => {
    setFilterChecklist((prev) => ({
      ...prev,
      [location]: !prev[location],
    }))
  }

  const totalFilters = filterLocations.rooms.length + filterLocations.commonAreas.length
  const completedFilters = Object.values(filterChecklist).filter(Boolean).length
  const completionPercentage = Math.round((completedFilters / totalFilters) * 100)

  const handleCompleteAllFilters = async () => {
    if (!operatorName.trim()) {
      alert("Por favor ingresa el nombre del operario")
      return
    }

    const cleanedFilters = Object.keys(filterChecklist).filter((key) => filterChecklist[key])

    try {
      const response = await fetch("/api/filter-cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          cleanedFilters,
          operatorName: operatorName.trim(),
          observations: observations.trim() || null,
        }),
      })

      if (response.ok) {
        setShowFilterDialog(false)
        fetchLastCleaningDate()
        alert("Limpieza de filtros registrada exitosamente")
      } else {
        alert("Error al registrar la limpieza")
      }
    } catch (error) {
      console.error("Error saving filter cleaning:", error)
      alert("Error al guardar el registro")
    }
  }

  const handleCompletePumpChange = async () => {
    if (!selectedPump) {
      alert("Por favor selecciona una bomba")
      return
    }
    if (!pumpOperatorName.trim()) {
      alert("Por favor ingresa el nombre del operario")
      return
    }

    try {
      const response = await fetch("/api/pump-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          pumpNumber: selectedPump,
          operatorName: pumpOperatorName.trim(),
          observations: pumpObservations.trim() || null,
        }),
      })

      if (response.ok) {
        setShowPumpDialog(false)
        fetchLastPumpChangeDate()
        alert("Cambio de bomba registrado exitosamente")
      } else {
        alert("Error al registrar el cambio de bomba")
      }
    } catch (error) {
      console.error("Error saving pump change:", error)
      alert("Error al guardar el registro")
    }
  }

  const toggleFumigationRoom = (room: string) => {
    setFumigationChecklist((prev) => ({
      ...prev,
      [room]: !prev[room],
    }))
  }

  const totalFumigationRooms = fumigationRooms.length
  const completedFumigationRooms = Object.values(fumigationChecklist).filter(Boolean).length
  const fumigationCompletionPercentage = Math.round((completedFumigationRooms / totalFumigationRooms) * 100)

  const handleCompleteFumigation = async () => {
    if (!fumigationOperatorName.trim()) {
      alert("Por favor ingresa el nombre del operario o empresa")
      return
    }

    const fumigatedRooms = Object.keys(fumigationChecklist).filter((key) => fumigationChecklist[key])

    try {
      const response = await fetch("/api/fumigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          fumigatedRooms,
          operatorName: fumigationOperatorName.trim(),
          observations: fumigationObservations.trim() || null,
        }),
      })

      if (response.ok) {
        setShowFumigationDialog(false)
        fetchFumigationStatus()
        alert("Fumigación registrada exitosamente")
      } else {
        alert("Error al registrar la fumigación")
      }
    } catch (error) {
      console.error("Error saving fumigation:", error)
      alert("Error al guardar el registro")
    }
  }

  const fumigationSummary = {
    upToDate: fumigationStatus.filter((s) => s.status === "upToDate").length,
    upcoming: fumigationStatus.filter((s) => s.status === "upcoming").length,
    overdue: fumigationStatus.filter((s) => s.status === "overdue").length,
  }

  const getDaysUntilNextCleaning = () => {
    if (!nextDueDate) return null
    const today = new Date()
    const next = new Date(nextDueDate)
    const diffTime = next.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilNext = getDaysUntilNextCleaning()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${hotel}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Mantenimiento Preventivo</h1>
                <p className="text-sm text-slate-600">{hotelName}</p>
              </div>
            </div>
            <Link href={`/${hotel}/preventivo/historial`}>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Historial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lastCleaningDate && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">🌬️ Estado de Limpieza de Filtros</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700">
                    <strong>Última limpieza:</strong>{" "}
                    {new Date(lastCleaningDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {nextDueDate && (
                    <p className="text-slate-700">
                      <strong>Próxima limpieza:</strong>{" "}
                      {new Date(nextDueDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {daysUntilNext !== null && (
                        <Badge
                          className={`ml-2 ${
                            daysUntilNext < 0
                              ? "bg-red-100 text-red-800"
                              : daysUntilNext <= 3
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {daysUntilNext < 0
                            ? `Vencida hace ${Math.abs(daysUntilNext)} días`
                            : daysUntilNext === 0
                              ? "Vence hoy"
                              : `Faltan ${daysUntilNext} días`}
                        </Badge>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <Calendar className="h-16 w-16 text-blue-400" />
            </div>
          </Card>
        )}

        {lastPumpChangeDate && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">🔄 Estado de Cambio de Bombas</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700">
                    <strong>Último cambio:</strong>{" "}
                    {new Date(lastPumpChangeDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <Wrench className="h-16 w-16 text-green-400" />
            </div>
          </Card>
        )}

        {fumigationStatus.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">🪳 Estado de Fumigación</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-700">Al día: {fumigationSummary.upToDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-slate-700">Próximas: {fumigationSummary.upcoming}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-700">Vencidas: {fumigationSummary.overdue}</span>
                  </div>
                </div>
              </div>
              <Calendar className="h-16 w-16 text-purple-400" />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de tareas</p>
                <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
              </div>
              <Wrench className="h-12 w-12 text-slate-400" />
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600">
                  {tasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-amber-400" />
            </div>
          </Card>
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completadas este mes</p>
                <p className="text-3xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
          </Card>
        </div>

        {categories.map((category) => {
          const categoryTasks = getTasksByCategory(category.id)
          if (categoryTasks.length === 0) return null

          return (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={category.color}>{category.name}</Badge>
                <span className="text-sm text-slate-600">({categoryTasks.length} tareas)</span>
              </div>
              <div className="grid gap-4">
                {categoryTasks.map((task) => (
                  <Card key={task.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl">{task.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{task.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Próxima: {new Date(task.nextDue).toLocaleDateString("es-ES")}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {task.frequency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </main>

      <Dialog open={showPumpDialog} onOpenChange={setShowPumpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">🔄 Cambio de Bombas</DialogTitle>
            <DialogDescription>Selecciona la bomba que has cambiado y registra la información</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Selecciona la bomba *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPump === 1
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedPump(1)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔄</div>
                    <span className="text-lg font-bold">Bomba 1</span>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPump === 2
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedPump(2)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔄</div>
                    <span className="text-lg font-bold">Bomba 2</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label htmlFor="pump-operator" className="text-sm font-medium">
                  Nombre del Operario *
                </Label>
                <Input
                  id="pump-operator"
                  value={pumpOperatorName}
                  onChange={(e) => setPumpOperatorName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pump-observations" className="text-sm font-medium">
                  Observaciones (opcional)
                </Label>
                <Textarea
                  id="pump-observations"
                  value={pumpObservations}
                  onChange={(e) => setPumpObservations(e.target.value)}
                  placeholder="Ej: Cambio rutinario semanal"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPumpDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCompletePumpChange}
                disabled={!selectedPump || !pumpOperatorName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar Cambio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">🌬️ Limpieza de Filtros de Aire</DialogTitle>
            <DialogDescription>
              Marca cada filtro a medida que lo limpies. Progreso: {completedFilters}/{totalFilters} (
              {completionPercentage}%)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label htmlFor="operator" className="text-sm font-medium">
                  Nombre del Operario *
                </Label>
                <Input
                  id="operator"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="observations" className="text-sm font-medium">
                  Observaciones (opcional)
                </Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ej: Filtros muy sucios en habitaciones 201-205"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {filterLocations.rooms.map((room) => (
                <div
                  key={room}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    filterChecklist[room]
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleFilter(room)}
                >
                  <Checkbox checked={filterChecklist[room] || false} onCheckedChange={() => toggleFilter(room)} />
                  <span className="text-sm font-medium">{room}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-slate-900">Áreas Comunes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filterLocations.commonAreas.map((area) => (
                  <div
                    key={area}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      filterChecklist[area]
                        ? "bg-green-50 border-green-500"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => toggleFilter(area)}
                  >
                    <Checkbox checked={filterChecklist[area] || false} onCheckedChange={() => toggleFilter(area)} />
                    <span className="font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCompleteAllFilters}
                disabled={completionPercentage < 100 || !operatorName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar Limpieza
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFumigationDialog} onOpenChange={setShowFumigationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">🪳 Fumigación de Chinches</DialogTitle>
            <DialogDescription>
              Marca cada habitación fumigada. Progreso: {completedFumigationRooms}/{totalFumigationRooms} (
              {fumigationCompletionPercentage}%)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${fumigationCompletionPercentage}%` }}
              />
            </div>

            <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label htmlFor="fumigation-operator" className="text-sm font-medium">
                  Nombre del Operario o Empresa *
                </Label>
                <Input
                  id="fumigation-operator"
                  value={fumigationOperatorName}
                  onChange={(e) => setFumigationOperatorName(e.target.value)}
                  placeholder="Ej: Control de Plagas S.L."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fumigation-observations" className="text-sm font-medium">
                  Observaciones (opcional)
                </Label>
                <Textarea
                  id="fumigation-observations"
                  value={fumigationObservations}
                  onChange={(e) => setFumigationObservations(e.target.value)}
                  placeholder="Ej: Tipo de producto utilizado, incidencias encontradas, etc."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-slate-900">Habitaciones</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {fumigationRooms.map((room) => {
                  const roomStatus = fumigationStatus.find((s) => s.room === room)
                  const statusColor =
                    roomStatus?.status === "overdue"
                      ? "border-red-300 bg-red-50"
                      : roomStatus?.status === "upcoming"
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-green-300 bg-green-50"

                  return (
                    <div
                      key={room}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        fumigationChecklist[room]
                          ? "bg-purple-50 border-purple-500"
                          : `${statusColor} hover:border-slate-400`
                      }`}
                      onClick={() => toggleFumigationRoom(room)}
                    >
                      <Checkbox
                        checked={fumigationChecklist[room] || false}
                        onCheckedChange={() => toggleFumigationRoom(room)}
                      />
                      <span className="text-sm font-medium">{room}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFumigationDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCompleteFumigation}
                disabled={completedFumigationRooms === 0 || !fumigationOperatorName.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar Fumigación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
