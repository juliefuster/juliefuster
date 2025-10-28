"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Droplets,
  Wind,
  Wrench,
  Lightbulb,
  Bug,
  Flame,
  Zap,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowLeft,
  Printer,
  History,
} from "lucide-react"

import { ROOM_NUMBERS } from "@/lib/rooms" // ⬅️ ESTA LÍNEA AQUÍ ARRIBA, NO ABAJO

interface Task {
  id: number
  name: string
  frequency: string
  icon: any
  lastCompleted?: string
  nextDue?: string
  status: "completed" | "upcoming" | "overdue"
}

export default function PreventiveMaintenance() {
  // 📅 Día seleccionado en el calendario
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDayTasks, setSelectedDayTasks] = useState<any[]>([])
  const [dayDialogOpen, setDayDialogOpen] = useState(false)

  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel

  const [pumpDialogOpen, setPumpDialogOpen] = useState(false)
  const [fumigationDialogOpen, setFumigationDialogOpen] = useState(false)
  const [filterCleaningDialogOpen, setFilterCleaningDialogOpen] = useState(false)
  // 🆕 Dialogo genérico para tareas mensuales
  const [genericTaskDialogOpen, setGenericTaskDialogOpen] = useState(false)
  const [selectedGenericTask, setSelectedGenericTask] = useState<Task | null>(null)
  const [genericOperator, setGenericOperator] = useState("")
  const [genericObservations, setGenericObservations] = useState("")

  const [selectedPump, setSelectedPump] = useState<1 | 2 | null>(null)
  const [operatorName, setOperatorName] = useState("")
  const [observations, setObservations] = useState("")
  const [purgePerformed, setPurgePerformed] = useState<boolean | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [fumigationDate, setFumigationDate] = useState(new Date().toISOString().split("T")[0])
  const [filterCleaningDate, setFilterCleaningDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [lastPumpChange, setLastPumpChange] = useState<string | null>(null)
  const [lastFumigation, setLastFumigation] = useState<string | null>(null)
  const [lastFilterCleaning, setLastFilterCleaning] = useState<string | null>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [loadingUpcoming, setLoadingUpcoming] = useState(false)
  // 📅 Estado del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [roomSearchQuery, setRoomSearchQuery] = useState("")

  const [showerGroutDialogOpen, setShowerGroutDialogOpen] = useState(false)
  const [showerGroutType, setShowerGroutType] = useState("")
  const [showerGroutDate, setShowerGroutDate] = useState(new Date().toISOString().split("T")[0])
  const [lastShowerGrout, setLastShowerGrout] = useState<string | null>(null)

  const normalizedHotel = typeof hotel === "string" ? hotel.toLowerCase().trim() : ""
  const rooms = ROOM_NUMBERS[normalizedHotel as keyof typeof ROOM_NUMBERS] ?? ROOM_NUMBERS["caledonian"] // fallback temporal

  useEffect(() => {
    const fetchCalendarTasks = async () => {
      try {
        setLoadingUpcoming(true)
        const res = await fetch(`/api/preventive-maintenance/upcoming?hotel=${hotel}`)
        const data = await res.json()
        console.log("[v0] Calendar tasks received:", data.tasks?.length || 0)
        console.log(
          "[v0] Sample tasks:",
          data.tasks?.slice(0, 3).map((t: any) => ({ type: t.type, date: t.date, rooms: t.rooms?.length || 0 })),
        )
        setUpcomingTasks(data.tasks || [])
      } catch (err) {
        console.error("Error cargando calendario:", err)
      } finally {
        setLoadingUpcoming(false)
      }
    }
    fetchCalendarTasks()
  }, [hotel])

  useEffect(() => {
    const fetchLastDates = async () => {
      try {
        const pumpRes = await fetch(`/api/pump-change/last-date?hotel=${hotel}`)
        if (pumpRes.ok) {
          const pumpData = await pumpRes.json()
          setLastPumpChange(pumpData.lastDate)
        }

        const fumRes = await fetch(`/api/fumigation/last-date?hotel=${hotel}`)
        if (fumRes.ok) {
          const fumData = await fumRes.json()
          setLastFumigation(fumData.lastDate)
        }

        const filterRes = await fetch(`/api/filter-cleaning/last-date?hotel=${hotel}`)
        if (filterRes.ok) {
          const filterData = await filterRes.json()
          setLastFilterCleaning(filterData.lastDate)
        }

        const showerGroutRes = await fetch(`/api/shower-grout/last-date?hotel=${hotel}`)
        if (showerGroutRes.ok) {
          const showerGroutData = await showerGroutRes.json()
          setLastShowerGrout(showerGroutData.lastDate)
        }
      } catch (error) {
        console.error("Error fetching last dates:", error)
      }
    }
    fetchLastDates()
  }, [hotel])

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "Cambio de bombas", frequency: "Semanal", icon: Droplets, status: "upcoming" },
    { id: 2, name: "Revisión de desagües", frequency: "Semanal", icon: Droplets, status: "upcoming" },
    { id: 3, name: "Limpieza filtros de aire", frequency: "Quincenal", icon: Wind, status: "upcoming" },
    { id: 4, name: "Revisión de desagües", frequency: "Quincenal", icon: Droplets, status: "upcoming" },
    { id: 5, name: "Limpieza marquesina", frequency: "Mensual", icon: Wrench, status: "upcoming" },
    { id: 6, name: "Limpieza sala de máquinas", frequency: "Mensual", icon: Wrench, status: "upcoming" },
    { id: 7, name: "Revisión luces de emergencia", frequency: "Mensual", icon: Lightbulb, status: "upcoming" },
    { id: 8, name: "Limpieza bajante S1", frequency: "Mensual", icon: Droplets, status: "upcoming" },
    { id: 9, name: "Limpieza pozo S2", frequency: "Mensual", icon: Droplets, status: "upcoming" },
    // 🆕 Nuevas tareas mensuales
    { id: 19, name: "Claraboya", frequency: "Mensual", icon: Wrench, status: "upcoming" },
    { id: 20, name: "Tubo bombero", frequency: "Mensual", icon: Wrench, status: "upcoming" },
    { id: 21, name: "Desagües", frequency: "Mensual", icon: Droplets, status: "upcoming" },
    {
      id: 10,
      name: "Mover llaves de paso de todo el hotel",
      frequency: "Cada 2 meses",
      icon: Wrench,
      status: "upcoming",
    },
    { id: 11, name: "Fumigación de chinches", frequency: "Trimestral", icon: Bug, status: "upcoming" },
    { id: 12, name: "Limpieza filtros caldera (bomba roja)", frequency: "Trimestral", icon: Flame, status: "upcoming" },
    { id: 13, name: "Revisión aire acondicionado", frequency: "Anual (externo)", icon: Wind, status: "upcoming" },
    { id: 14, name: "Grupo electrógeno", frequency: "Anual (externo)", icon: Zap, status: "upcoming" },
    { id: 15, name: "Alarma y extintores", frequency: "Anual (externo)", icon: Bell, status: "upcoming" },
    {
      id: 16,
      name: "Control legionela",
      frequency: "Cada 3-4 meses (externo)",
      icon: AlertTriangle,
      status: "upcoming",
    },
    { id: 17, name: "Control de plagas", frequency: "Mensual (externo)", icon: Bug, status: "upcoming" },
    {
      id: 18,
      name: "Revisión ascensor y montacargas",
      frequency: "Mensual (externo)",
      icon: Wrench,
      status: "upcoming",
    },
    { id: 22, name: "Boradas de ducha o pica", frequency: "Anual", icon: Wrench, status: "upcoming" },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const groupedTasks = {
    Semanal: tasks.filter((t) => t.frequency === "Semanal"),
    Quincenal: tasks.filter((t) => t.frequency === "Quincenal"),
    Mensual: tasks.filter((t) => t.frequency === "Mensual"),
    "Cada 2 meses": tasks.filter((t) => t.frequency === "Cada 2 meses"),
    Trimestral: tasks.filter((t) => t.frequency === "Trimestral"),
    Anual: tasks.filter((t) => t.frequency.includes("Anual")),
    Otros: tasks.filter(
      (t) =>
        !["Semanal", "Quincenal", "Mensual", "Cada 2 meses", "Trimestral"].includes(t.frequency) &&
        !t.frequency.includes("Anual"),
    ),
  }

  const handlePumpChangeSubmit = async () => {
    if (!selectedPump || !operatorName.trim() || purgePerformed === null) {
      alert("Por favor completa todos los campos obligatorios (bomba, operario y purga)")
      return
    }

    try {
      const response = await fetch("/api/pump-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          pumpNumber: selectedPump,
          operatorName: operatorName.trim(),
          observations: observations.trim() || null,
          purgePerformed,
        }),
      })

      if (!response.ok) throw new Error("Error al registrar cambio de bomba")

      alert("Cambio de bomba registrado exitosamente")
      setPumpDialogOpen(false)
      setSelectedPump(null)
      setOperatorName("")
      setObservations("")
      setPurgePerformed(null)

      const pumpRes = await fetch(`/api/pump-change/last-date?hotel=${hotel}`)
      if (pumpRes.ok) {
        const pumpData = await pumpRes.json()
        setLastPumpChange(pumpData.lastDate)
      }

      setTasks(
        tasks.map((task) =>
          task.id === 1
            ? { ...task, status: "completed" as const, lastCompleted: new Date().toLocaleDateString() }
            : task,
        ),
      )
    } catch (error) {
      console.error("Error:", error)
      alert("Error al registrar el cambio de bomba")
    }
  }

  const handleFumigationSubmit = async () => {
    if (selectedRooms.length === 0 || !operatorName.trim()) {
      alert("Por favor selecciona al menos una habitación e ingresa el nombre del responsable")
      return
    }

    try {
      const response = await fetch("/api/fumigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          date: fumigationDate,
          operator_name: operatorName.trim(),
          rooms: selectedRooms.join(", "), // Send as comma-separated string
          observations: observations.trim() || null, // Only user observations
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Fumigation API error:", errorData)
        throw new Error(errorData.error || "Error al registrar fumigación")
      }

      alert("Fumigación registrada exitosamente")
      setFumigationDialogOpen(false)
      setSelectedRooms([])
      setOperatorName("")
      setObservations("")
      setFumigationDate(new Date().toISOString().split("T")[0])

      const fumRes = await fetch(`/api/fumigation/last-date?hotel=${hotel}`)
      if (fumRes.ok) {
        const fumData = await fumRes.json()
        setLastFumigation(fumData.lastDate)
      }

      setTasks(
        tasks.map((task) =>
          task.id === 11
            ? { ...task, status: "completed" as const, lastCompleted: new Date().toLocaleDateString() }
            : task,
        ),
      )
    } catch (error) {
      console.error("[v0] Error submitting fumigation:", error)
      alert("Error al registrar la fumigación")
    }
  }

  const handleFilterCleaningSubmit = async () => {
    if (selectedFilters.length === 0 || !operatorName.trim()) {
      alert("Por favor selecciona al menos un filtro e ingresa el nombre del responsable")
      return
    }

    try {
      const response = await fetch("/api/filter-cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          date: filterCleaningDate,
          operator_name: operatorName.trim(),
          observations: observations.trim() || null,
          cleaned_filters: selectedFilters,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Filter cleaning API error:", errorData)
        throw new Error(errorData.error || "Error al registrar limpieza de filtros")
      }

      alert("Limpieza de filtros registrada exitosamente")
      setFilterCleaningDialogOpen(false)
      setSelectedFilters([])
      setOperatorName("")
      setObservations("")
      setFilterCleaningDate(new Date().toISOString().split("T")[0])

      const filterRes = await fetch(`/api/filter-cleaning/last-date?hotel=${hotel}`)
      if (filterRes.ok) {
        const filterData = await filterRes.json()
        setLastFilterCleaning(filterData.lastDate)
      }

      setTasks(
        tasks.map((task) =>
          task.id === 3
            ? { ...task, status: "completed" as const, lastCompleted: new Date().toLocaleDateString() }
            : task,
        ),
      )
    } catch (error) {
      console.error("[v0] Error submitting filter cleaning:", error)
      alert("Error al registrar la limpieza de filtros")
    }
  }

  const handleShowerGroutSubmit = async () => {
    if (!showerGroutType || !operatorName.trim() || selectedRooms.length === 0) {
      alert("Por favor completa todos los campos obligatorios (tipo, habitaciones y responsable)")
      return
    }

    try {
      const response = await fetch("/api/shower-grout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          type: showerGroutType,
          date: showerGroutDate,
          operator_name: operatorName.trim(),
          rooms: selectedRooms.join(", "), // ✅ Guardamos habitaciones seleccionadas
          observations: observations.trim() || null,
        }),
      })

      if (!response.ok) throw new Error("Error al registrar boradas")

      alert("Boradas registradas exitosamente")
      setShowerGroutDialogOpen(false)
      setShowerGroutType("")
      setSelectedRooms([]) // ✅ Limpiamos selección
      setOperatorName("")
      setObservations("")
      setShowerGroutDate(new Date().toISOString().split("T")[0])

      const showerGroutRes = await fetch(`/api/shower-grout/last-date?hotel=${hotel}`)
      if (showerGroutRes.ok) {
        const showerGroutData = await showerGroutRes.json()
        setLastShowerGrout(showerGroutData.lastDate)
      }

      setTasks(
        tasks.map((task) =>
          task.id === 22
            ? { ...task, status: "completed" as const, lastCompleted: new Date().toLocaleDateString() }
            : task,
        ),
      )
    } catch (error) {
      console.error("Error:", error)
      alert("Error al registrar las boradas")
    }
  }

  const handleCompleteTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Abrir los modales especiales
    if (taskId === 1) return setPumpDialogOpen(true)
    if (taskId === 11) return setFumigationDialogOpen(true)
    if (taskId === 3) return setFilterCleaningDialogOpen(true)
    if (taskId === 22) return setShowerGroutDialogOpen(true)

    // 🆕 Para las tareas genéricas → abrimos el diálogo visual
    setSelectedGenericTask(task)
    setGenericOperator("")
    setGenericObservations("")
    setGenericTaskDialogOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const isOverdue = (dateString: string) => {
    const taskDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return taskDate < today
  }

  const getDaysUntil = (dateString: string) => {
    const taskDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredUpcomingTasks = roomSearchQuery.trim()
    ? upcomingTasks.filter((task) => {
        if (!task.rooms || task.rooms.length === 0) return false
        return task.rooms.some((room: string) => room.toLowerCase().includes(roomSearchQuery.toLowerCase()))
      })
    : upcomingTasks

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-6 w-6 text-blue-600" />
                Mantenimiento Preventivo
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {Object.entries(groupedTasks).map(([frequency, frequencyTasks]) => {
              if (frequencyTasks.length === 0) return null
              return (
                <div key={frequency}>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">{frequency}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {frequencyTasks.map((task) => {
                      const Icon = task.icon
                      return (
                        <Card key={task.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{task.name}</CardTitle>
                                  <CardDescription className="text-xs">{task.frequency}</CardDescription>
                                </div>
                              </div>
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1 text-xs capitalize">
                                  {task.status === "completed"
                                    ? "Completado"
                                    : task.status === "upcoming"
                                      ? "Próximo"
                                      : "Vencido"}
                                </span>
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {task.lastCompleted && (
                              <p className="text-xs text-slate-600 mb-2">Último: {task.lastCompleted}</p>
                            )}
                            {task.id === 1 && lastPumpChange && (
                              <p className="text-xs text-slate-600 mb-2">
                                Último cambio: {new Date(lastPumpChange).toLocaleDateString()}
                              </p>
                            )}
                            {task.id === 11 && lastFumigation && (
                              <p className="text-xs text-slate-600 mb-2">
                                Última fumigación: {new Date(lastFumigation).toLocaleDateString()}
                              </p>
                            )}
                            {task.id === 3 && lastFilterCleaning && (
                              <p className="text-xs text-slate-600 mb-2">
                                Última limpieza: {new Date(lastFilterCleaning).toLocaleDateString()}
                              </p>
                            )}
                            {task.id === 22 && lastShowerGrout && (
                              <p className="text-xs text-slate-600 mb-2">
                                Última vez: {new Date(lastShowerGrout).toLocaleDateString()}
                              </p>
                            )}
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={task.status === "completed"}
                            >
                              {task.status === "completed" ? "Completado" : "Completar"}
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Tareas Pendientes</CardTitle>
        <CardDescription>Fumigación y limpieza de filtros próximas o vencidas</CardDescription>
      </div>
      <div className="flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setLoadingUpcoming(true)
            try {
              const res = await fetch(`/api/preventive-maintenance/upcoming?hotel=${hotel}`)
              const data = await res.json()

              // ✅ Solo Fumigación y Limpieza de filtros
              const filtered = (data.tasks || []).filter(
                (t: any) =>
                  t.type?.toLowerCase().includes("fumigación") ||
                  t.type?.toLowerCase().includes("filtro"),
              )
              setUpcomingTasks(filtered)
            } catch (err) {
              console.error("Error refrescando tareas:", err)
            } finally {
              setLoadingUpcoming(false)
            }
          }}
          disabled={loadingUpcoming}
        >
          {loadingUpcoming ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>
    </CardHeader>

    <CardContent>
      {loadingUpcoming ? (
        <div className="text-center py-12 text-slate-500">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50 animate-pulse" />
          <p>Cargando tareas...</p>
        </div>
      ) : upcomingTasks.length === 0 ? (
        <div className="text-center py-12 text-green-600">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3" />
          <p className="font-medium">No hay tareas pendientes en fumigación o filtros 🎉</p>
        </div>
      ) : (
        (() => {
          // ✅ Agrupar tareas por tipo + fecha + responsable + frecuencia
          const grouped = upcomingTasks.reduce((acc: any, task: any) => {
            const key = `${task.type}-${task.date}-${task.operator_name || ""}-${task.frequency || ""}`
            if (!acc[key]) acc[key] = { ...task, rooms: [] }
            if (Array.isArray(task.rooms)) {
              acc[key].rooms.push(...task.rooms)
            } else if (typeof task.rooms === "string" && task.rooms.trim() !== "") {
              acc[key].rooms.push(task.rooms)
            }
            return acc
          }, {})

          const groupedArray = Object.values(grouped)

          return (
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Tarea</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Fecha</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Habitaciones</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Responsable</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Última vez</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Frecuencia</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedArray.map((task: any, i: number) => {
                    const today = new Date()
                    const taskDate = new Date(task.date)
                    const daysUntil = Math.ceil(
                      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    )
                    const isOverdue = daysUntil < 0
                    const isToday = daysUntil === 0

                    // 🔹 Ordenar habitaciones y eliminar duplicados
                    const uniqueRooms = [...new Set(task.rooms || [])].sort((a, b) =>
                      a.localeCompare(b, "es", { numeric: true }),
                    )

                    return (
                      <tr
                        key={i}
                        className={`border-b hover:bg-slate-50 ${
                          isOverdue
                            ? "bg-red-50"
                            : isToday
                            ? "bg-orange-50"
                            : "bg-blue-50"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-slate-800">{task.type}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {taskDate.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-2 text-slate-700 max-w-xs">
                          {uniqueRooms.length > 0 ? (
                            <span className="text-xs text-slate-700 block truncate">
                              {uniqueRooms.slice(0, 12).join(", ")}
                              {uniqueRooms.length > 12 && ` (+${uniqueRooms.length - 12})`}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{task.operator_name || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {task.lastCompleted
                            ? new Date(task.lastCompleted).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">{task.frequency}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isOverdue
                                ? "bg-red-100 text-red-800 border-red-300"
                                : isToday
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {isOverdue
                              ? `Retraso ${Math.abs(daysUntil)}d`
                              : isToday
                              ? "Hoy"
                              : `En ${daysUntil}d`}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })()
      )}
    </CardContent>
  </Card>
</TabsContent>


          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Historial de Cambio de Bombas
                  </CardTitle>
                  <CardDescription>Ver todos los cambios de bombas registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/cambio-bombas`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-purple-600" />
                    Historial de Fumigaciones
                  </CardTitle>
                  <CardDescription>Ver todas las fumigaciones registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/fumigacion`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-green-600" />
                    Historial de Limpieza de Filtros
                  </CardTitle>
                  <CardDescription>Ver todas las limpiezas de filtros registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/limpieza-filtros`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    Historial de Tareas Mensuales
                  </CardTitle>
                  <CardDescription>
                    Limpieza marquesina, Limpieza sala de máquinas, Revisión luces de emergencia, Limpieza bajante S1,
                    Limpieza pozo S2, Claraboya, Tubo bombero, Desagües
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/tareas-mensuales`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Historial de Boradas de Ducha o Pica
                  </CardTitle>
                  <CardDescription>Ver todas las boradas registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/boradas-ducha`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    Revisión Semestral
                  </CardTitle>
                  <CardDescription>Revisar estado de boradas y picas del hotel</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/revision-semestral`}>
                    <Button className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      Ver Revisión
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 💧 Pump Change Dialog (espaciado corregido y scroll en móvil) */}
      <Dialog open={pumpDialogOpen} onOpenChange={setPumpDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold text-slate-900">Registrar Cambio de Bomba</DialogTitle>
            <DialogDescription className="text-slate-600">
              Selecciona la bomba cambiada e ingresa los detalles del mantenimiento realizado.
            </DialogDescription>
          </DialogHeader>

          {/* 🔹 Contenido con más espacio visual */}
          <div className="space-y-5 mt-4">
            {/* Selección de bomba */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Selecciona la Bomba *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedPump === 1 ? "default" : "outline"}
                  onClick={() => setSelectedPump(1)}
                  className="w-full"
                >
                  Bomba 1
                </Button>
                <Button
                  variant={selectedPump === 2 ? "default" : "outline"}
                  onClick={() => setSelectedPump(2)}
                  className="w-full"
                >
                  Bomba 2
                </Button>
              </div>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="operator" className="font-medium text-sm text-slate-800">
                Nombre del Operario *
              </Label>
              <select
                id="operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar operario...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
              </select>
            </div>

            {/* Purga */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">¿Purga realizada? *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={purgePerformed === true ? "default" : "outline"}
                  onClick={() => setPurgePerformed(true)}
                  className="w-full"
                >
                  Sí
                </Button>
                <Button
                  variant={purgePerformed === false ? "default" : "outline"}
                  onClick={() => setPurgePerformed(false)}
                  className="w-full"
                >
                  No
                </Button>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observaciones opcionales sobre el cambio o el estado de la bomba"
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-3">
              <Button variant="outline" onClick={() => setPumpDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handlePumpChangeSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🐞 Fumigation Dialog (mejorado con más espacio y estilo coherente) */}
      <Dialog open={fumigationDialogOpen} onOpenChange={setFumigationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold">Registrar Fumigación</DialogTitle>
            <DialogDescription className="text-slate-600">
              Selecciona las habitaciones fumigadas e ingresa los detalles
            </DialogDescription>
          </DialogHeader>

          {/* 🔹 Contenido con mejor separación visual */}
          <div className="space-y-5 mt-3">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fumigation-date" className="font-medium text-sm text-slate-800">
                Fecha de Fumigación *
              </Label>
              <Input
                id="fumigation-date"
                type="date"
                value={fumigationDate}
                onChange={(e) => setFumigationDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Habitaciones */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Habitaciones Fumigadas *</Label>
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-56 overflow-y-auto p-3 border rounded-lg bg-slate-50">
                {rooms.map((room) => (
                  <div key={room} className="flex items-center space-x-2">
                    <Checkbox
                      id={`room-${room}`}
                      checked={selectedRooms.includes(room)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRooms([...selectedRooms, room])
                        } else {
                          setSelectedRooms(selectedRooms.filter((r) => r !== room))
                        }
                      }}
                    />
                    <label
                      htmlFor={`room-${room}`}
                      className="text-sm cursor-pointer leading-tight break-words text-slate-700"
                    >
                      {room}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Seleccionadas: {selectedRooms.length} habitaciones</p>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="fumigation-operator" className="font-medium text-sm text-slate-800">
                Responsable *
              </Label>
              <select
                id="fumigation-operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar operario...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="fumigation-observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="fumigation-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Producto utilizado, incidencias, etc."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setFumigationDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleFumigationSubmit} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🧽 Filter Cleaning Dialog (mejorado con más espacio y legibilidad) */}
      <Dialog open={filterCleaningDialogOpen} onOpenChange={setFilterCleaningDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold">Registrar Limpieza de Filtros</DialogTitle>
            <DialogDescription className="text-slate-600">
              Selecciona los filtros limpiados e ingresa los detalles
            </DialogDescription>
          </DialogHeader>

          {/* 🔹 Contenido con más espacio visual */}
          <div className="space-y-5 mt-3">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="filter-cleaning-date" className="font-medium text-sm text-slate-800">
                Fecha de Limpieza *
              </Label>
              <Input
                id="filter-cleaning-date"
                type="date"
                value={filterCleaningDate}
                onChange={(e) => setFilterCleaningDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Habitaciones / Filtros */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Filtros Limpiados (Habitaciones) *</Label>
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-56 overflow-y-auto p-3 border rounded-lg bg-slate-50">
                {rooms.map((room) => (
                  <div key={room} className="flex items-center space-x-2">
                    <Checkbox
                      id={`room-${room}`}
                      checked={selectedFilters.includes(room)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFilters([...selectedFilters, room])
                        } else {
                          setSelectedFilters(selectedFilters.filter((r) => r !== room))
                        }
                      }}
                    />
                    <label
                      htmlFor={`room-${room}`}
                      className="text-sm cursor-pointer leading-tight break-words text-slate-700"
                    >
                      {room}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Seleccionados: {selectedFilters.length} filtros</p>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="filter-operator" className="font-medium text-sm text-slate-800">
                Responsable *
              </Label>
              <select
                id="filter-operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar operario...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="filter-observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="filter-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Estado de los filtros, incidencias, etc."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setFilterCleaningDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleFilterCleaningSubmit} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📅 Dialog de Detalle del Día */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tareas del {selectedDay ? new Date(selectedDay + "T00:00:00").toLocaleDateString("es-ES") : ""}
            </DialogTitle>
            <DialogDescription>Detalles de mantenimiento programado</DialogDescription>
          </DialogHeader>

          {selectedDayTasks.length > 0 ? (
            <div className="space-y-4">
              {selectedDayTasks.map((task: any, i: number) => (
                <Card key={i} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{task.type}</CardTitle>
                    <CardDescription>{task.frequency || "Tarea programada"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {task.rooms && task.rooms.length > 0 && (
                      <div className="text-sm">
                        <strong className="text-slate-700">
                          {task.type.includes("filtro") ? "Filtros a limpiar:" : "Habitaciones:"}
                        </strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.rooms.map((room: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {room}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {task.pumpNumber && (
                      <p className="text-sm text-slate-600">
                        <strong>Bomba:</strong> #{task.pumpNumber}
                      </p>
                    )}
                    {task.operator && (
                      <p className="text-sm text-slate-600">
                        <strong>Último operario:</strong> {task.operator}
                      </p>
                    )}
                    {task.lastCompleted && (
                      <p className="text-sm text-slate-600">
                        <strong>Última vez:</strong> {new Date(task.lastCompleted).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-6">No hay tareas para este día</p>
          )}
        </DialogContent>
      </Dialog>
      {/* 🆕 Generic Task Completion Dialog (mejorado con más espacio) */}
      <Dialog open={genericTaskDialogOpen} onOpenChange={setGenericTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold">
              Registrar {selectedGenericTask?.name || "tarea"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Ingresa el operario y observaciones opcionales
            </DialogDescription>
          </DialogHeader>

          {/* 🔹 Contenido con más espacio visual */}
          <div className="space-y-5 mt-3">
            <div className="space-y-2">
              <Label htmlFor="generic-operator" className="font-medium text-sm text-slate-800">
                Responsable *
              </Label>
              <select
                id="generic-operator"
                value={genericOperator}
                onChange={(e) => setGenericOperator(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar operario...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generic-observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="generic-observations"
                value={genericObservations}
                onChange={(e) => setGenericObservations(e.target.value)}
                placeholder="Detalles, incidencias, etc."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setGenericTaskDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={async () => {
                  if (!genericOperator.trim()) {
                    alert("Debes introducir un nombre de operario")
                    return
                  }

                  try {
                    const response = await fetch("/api/monthly-tasks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        hotel,
                        taskId: selectedGenericTask?.id,
                        taskName: selectedGenericTask?.name,
                        operatorName: genericOperator.trim(),
                        observations: genericObservations.trim() || null,
                      }),
                    })

                    if (!response.ok) throw new Error("Error al guardar")

                    alert(`✅ ${selectedGenericTask?.name} registrada correctamente`)
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === selectedGenericTask?.id
                          ? {
                              ...t,
                              status: "completed" as const,
                              lastCompleted: new Date().toLocaleDateString(),
                            }
                          : t,
                      ),
                    )
                    setGenericTaskDialogOpen(false)
                  } catch (err) {
                    console.error("❌ Error:", err)
                    alert("Error al guardar en Supabase")
                  }
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 💧 Shower Grout Dialog con habitaciones añadidas */}
      <Dialog open={showerGroutDialogOpen} onOpenChange={setShowerGroutDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Registrar Boradas de Ducha o Pica
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Selecciona el tipo, las habitaciones e ingresa los detalles del mantenimiento realizado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Tipo *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={showerGroutType === "Ducha" ? "default" : "outline"}
                  onClick={() => setShowerGroutType("Ducha")}
                  className="w-full"
                >
                  Ducha
                </Button>
                <Button
                  variant={showerGroutType === "Pica" ? "default" : "outline"}
                  onClick={() => setShowerGroutType("Pica")}
                  className="w-full"
                >
                  Pica
                </Button>
              </div>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="shower-grout-date" className="font-medium text-sm text-slate-800">
                Fecha *
              </Label>
              <Input
                id="shower-grout-date"
                type="date"
                value={showerGroutDate}
                onChange={(e) => setShowerGroutDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* 🆕 Habitaciones */}
            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Habitaciones *</Label>
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-56 overflow-y-auto p-3 border rounded-lg bg-slate-50">
                {rooms
                  .filter((room) => /^\d+$/.test(room)) // ✅ Solo habitaciones numéricas
                  .map((room) => (
                    <div key={room} className="flex items-center space-x-2">
                      <Checkbox
                        id={`room-grout-${room}`}
                        checked={selectedRooms.includes(room)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRooms([...selectedRooms, room])
                          } else {
                            setSelectedRooms(selectedRooms.filter((r) => r !== room))
                          }
                        }}
                      />
                      <label
                        htmlFor={`room-grout-${room}`}
                        className="text-sm cursor-pointer leading-tight text-slate-700"
                      >
                        {room}
                      </label>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Seleccionadas: {selectedRooms.length} habitaciones</p>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="shower-grout-operator" className="font-medium text-sm text-slate-800">
                Responsable *
              </Label>
              <select
                id="shower-grout-operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar operario...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="shower-grout-observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="shower-grout-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observaciones opcionales sobre el estado o el trabajo realizado"
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-3">
              <Button variant="outline" onClick={() => setShowerGroutDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleShowerGroutSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
<style jsx global>{`
  @media print {
    /* 🧾 Configuración general de página */
    @page {
      size: A4 landscape;
      margin: 1cm;
    }

    body {
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-size: 10px !important;
      line-height: 1.2 !important;
      position: relative;
    }

    /* 🚫 Ocultar navegación, tabs y botones */
    header,
    nav,
    button,
    .print\\:hidden,
    .TabsList,
    [class*="tabs"],
    [class*="TabsList"],
    [class*="TabsTrigger"],
    div[role="tablist"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    main {
      display: block !important;
      margin: 0;
      padding: 0;
    }

    /* 🏷️ Encabezado general de impresión */
    body::before {
      content: "🏨 Mantenimiento Preventivo — 📅 Impreso el ${new Date().toLocaleDateString("es-ES")}";
      display: block;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      margin-bottom: 10px;
      width: 100%;
    }

    /* 🗓️ Tablas del calendario */
    table {
      width: 100%;
      border-collapse: collapse !important;
      page-break-inside: auto;
      font-size: 10px !important;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
      height: 14px !important;
    }

    th,
    td {
      border: 1px solid #ccc !important;
      padding: 2px 4px !important;
      font-size: 9.5px !important;
      line-height: 1.1 !important;
      vertical-align: middle !important;
    }

    th {
      background-color: #f1f5f9 !important;
      font-weight: bold !important;
      text-align: left !important;
    }

    /* 🎨 Colores de estado */
    .bg-red-50 {
      background-color: #fef2f2 !important;
    }

    .bg-orange-50 {
      background-color: #fff7ed !important;
    }

    .bg-blue-50 {
      background-color: #eff6ff !important;
    }

    /* 📦 Compactar tarjetas y eliminar sombras */
    .card,
    [class*="Card"],
    .border,
    .rounded-lg {
      box-shadow: none !important;
      border: 1px solid #ccc !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* 🏷️ Ajustar badges */
    .badge,
    .Badge,
    [class*="Badge"] {
      font-size: 8.5px !important;
      padding: 1px 3px !important;
      line-height: 1 !important;
      border-width: 1px !important;
    }

    /* 🔠 “Tareas Pendientes” más grande y destacado */
    h2,
    h3,
    .text-xl,
    .text-lg {
      font-size: 14px !important;
      font-weight: 700 !important;
      text-align: center !important;
      color: #0f172a !important;
      margin-bottom: 6px !important;
    }

    /* Evitar saltos dentro de tarjetas */
    .card,
    .Card {
      page-break-inside: avoid !important;
    }
  }
`}</style>


    </div>
  )
}
