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
import { eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { ROOM_NUMBERS } from "@/lib/rooms"
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

import { ROOM_NUMBERS } from "@/lib/rooms"

const normalizedHotel = typeof hotel === "string" ? hotel.toLowerCase().trim() : ""
const rooms =
  ROOM_NUMBERS[normalizedHotel as keyof typeof ROOM_NUMBERS] ??
  ROOM_NUMBERS["caledonian"] // fallback temporal



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
      const roomsList = `Habitaciones fumigadas: ${selectedRooms.join(", ")}`
      const fullObservations = observations.trim() ? `${roomsList}\n\n${observations.trim()}` : roomsList

      const response = await fetch("/api/fumigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          date: fumigationDate,
          operator_name: operatorName.trim(),
          observations: fullObservations,
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

  const handleCompleteTask = (taskId: number) => {
    if (taskId === 1) {
      setPumpDialogOpen(true)
      return
    }
    if (taskId === 11) {
      setFumigationDialogOpen(true)
      return
    }
    if (taskId === 3) {
      setFilterCleaningDialogOpen(true)
      return
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "completed" as const, lastCompleted: new Date().toLocaleDateString() }
          : task,
      ),
    )
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
                  <CardTitle>Calendario de Tareas de Mantenimiento</CardTitle>
                  <CardDescription>Vista mensual con las próximas tareas programadas</CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {/* 🔹 Estado del calendario */}
                {loadingUpcoming ? (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cargando calendario...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-sm">
                        <Label htmlFor="room-search" className="text-sm font-medium mb-2 block">
                          Buscar por habitación
                        </Label>
                        <Input
                          id="room-search"
                          type="text"
                          placeholder="Ej: 101, 202..."
                          value={roomSearchQuery}
                          onChange={(e) => setRoomSearchQuery(e.target.value)}
                          className="w-full"
                        />
                        {roomSearchQuery && (
                          <p className="text-xs text-slate-600 mt-1">
                            Mostrando {filteredUpcomingTasks.length} de {upcomingTasks.length} tareas
                          </p>
                        )}
                      </div>
                      {roomSearchQuery && (
                        <Button variant="outline" size="sm" onClick={() => setRoomSearchQuery("")} className="mt-6">
                          Limpiar filtro
                        </Button>
                      )}
                    </div>

                    {/* 🔹 Navegación de meses */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                        }
                      >
                        ← Mes anterior
                      </Button>

                      <h2 className="text-lg font-semibold text-slate-800 capitalize">
                        {currentMonth.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                      </h2>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                        }
                      >
                        Mes siguiente →
                      </Button>
                    </div>

                    {/* 🔹 Cabecera de días */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-600">
                      {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                        <div key={d} className="py-1 uppercase">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* 🔹 Celdas del calendario */}
                    <div className="grid grid-cols-7 gap-2">
                      {eachDayOfInterval({
                        start: startOfMonth(currentMonth),
                        end: endOfMonth(currentMonth),
                      }).map((day) => {
                        const dayISO = day.toISOString().split("T")[0]
                        const dayTasks = filteredUpcomingTasks.filter((t) => t.date === dayISO)

                        if (day.getDate() <= 3) {
                          console.log(
                            `[v0] Day ${dayISO}: ${dayTasks.length} tasks`,
                            dayTasks.map((t) => t.type),
                          )
                        }

                        return (
                          <div
                            key={dayISO}
                            className="border rounded-md p-2 min-h-[90px] bg-white hover:bg-slate-50 transition-all"
                          >
                            <div className="text-xs font-semibold text-slate-700 mb-1">{day.getDate()}</div>

                            {dayTasks.length > 0 ? (
                              <div className="space-y-1">
                                {dayTasks.map((task: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`text-[10px] px-1 py-0.5 rounded-md truncate cursor-pointer hover:shadow-md hover:scale-105 transition-all ${
                                      task.type.includes("bomba")
                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                        : task.type.includes("filtro")
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                    }`}
                                    title={`${task.type}${task.rooms?.length ? ` - ${task.rooms.length} habitaciones` : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedDay(dayISO)
                                      setSelectedDayTasks(dayTasks)
                                      setDayDialogOpen(true)
                                    }}
                                  >
                                    {task.type}
                                    {task.rooms?.length > 0 && (
                                      <span className="ml-1 font-semibold">({task.rooms.length})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[9px] text-slate-300">—</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
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
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Pump Change Dialog */}
      <Dialog open={pumpDialogOpen} onOpenChange={setPumpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Cambio de Bomba</DialogTitle>
            <DialogDescription>Selecciona la bomba cambiada e ingresa los detalles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecciona la Bomba</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
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
            <div>
              <Label htmlFor="operator">Nombre del Operario *</Label>
              <Input
                id="operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Ingresa el nombre"
              />
            </div>
            <div>
              <Label>¿Purga realizada? *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
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
            <div>
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observaciones opcionales"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPumpDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handlePumpChangeSubmit} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fumigation Dialog */}
      <Dialog open={fumigationDialogOpen} onOpenChange={setFumigationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Fumigación</DialogTitle>
            <DialogDescription>Selecciona las habitaciones fumigadas e ingresa los detalles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fumigation-date">Fecha de Fumigación *</Label>
              <Input
                id="fumigation-date"
                type="date"
                value={fumigationDate}
                onChange={(e) => setFumigationDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Habitaciones Fumigadas *</Label>
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
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
                    <label htmlFor={`room-${room}`} className="text-sm cursor-pointer">
                      {room}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Seleccionadas: {selectedRooms.length} habitaciones</p>
            </div>
            <div>
              <Label htmlFor="fumigation-operator">Responsable *</Label>
              <Input
                id="fumigation-operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Nombre del responsable o empresa"
              />
            </div>
            <div>
              <Label htmlFor="fumigation-observations">Observaciones</Label>
              <Textarea
                id="fumigation-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Producto utilizado, incidencias, etc."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
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

      {/* Filter Cleaning Dialog */}
      <Dialog open={filterCleaningDialogOpen} onOpenChange={setFilterCleaningDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Limpieza de Filtros</DialogTitle>
            <DialogDescription>Selecciona los filtros limpiados e ingresa los detalles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-cleaning-date">Fecha de Limpieza *</Label>
              <Input
                id="filter-cleaning-date"
                type="date"
                value={filterCleaningDate}
                onChange={(e) => setFilterCleaningDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Filtros Limpiados (Habitaciones) *</Label>
         <div className="grid grid-cols-6 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">


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
  className="text-sm cursor-pointer leading-tight break-words"
>
  {room}
</label>

                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Seleccionados: {selectedFilters.length} filtros</p>
            </div>
            <div>
              <Label htmlFor="filter-operator">Responsable *</Label>
              <Input
                id="filter-operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Nombre del responsable"
              />
            </div>
            <div>
              <Label htmlFor="filter-observations">Observaciones</Label>
              <Textarea
                id="filter-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Estado de los filtros, incidencias, etc."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
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

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  )
}
