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
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Droplets,
  Wind,
  Lightbulb,
  Wrench,
  Bug,
  Flame,
  AlertTriangle,
  Zap,
  Bell,
  Printer,
  History,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

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
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel

  const [pumpDialogOpen, setPumpDialogOpen] = useState(false)
  const [fumigationDialogOpen, setFumigationDialogOpen] = useState(false)
  const [selectedPump, setSelectedPump] = useState<1 | 2 | null>(null)
  const [operatorName, setOperatorName] = useState("")
  const [observations, setObservations] = useState("")
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [fumigationDate, setFumigationDate] = useState(new Date().toISOString().split("T")[0])
  const [lastPumpChange, setLastPumpChange] = useState<string | null>(null)
  const [lastFumigation, setLastFumigation] = useState<string | null>(null)

  // Room numbers for fumigation
  const rooms = [
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
    if (!selectedPump || !operatorName.trim()) {
      alert("Por favor selecciona una bomba e ingresa el nombre del operario")
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
        }),
      })

      if (!response.ok) throw new Error("Error al registrar cambio de bomba")

      alert("Cambio de bomba registrado exitosamente")
      setPumpDialogOpen(false)
      setSelectedPump(null)
      setOperatorName("")
      setObservations("")

      // Refresh last pump change date
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
          fumigatedRooms: selectedRooms,
          operatorName: operatorName.trim(),
          observations: observations.trim() || null,
          fumigationDate,
        }),
      })

      if (!response.ok) throw new Error("Error al registrar fumigación")

      alert("Fumigación registrada exitosamente")
      setFumigationDialogOpen(false)
      setSelectedRooms([])
      setOperatorName("")
      setObservations("")
      setFumigationDate(new Date().toISOString().split("T")[0])

      // Refresh last fumigation date
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
      console.error("Error:", error)
      alert("Error al registrar la fumigación")
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6 print:hidden">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Completadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-900">
                    {tasks.filter((t) => t.status === "completed").length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                    <Clock className="h-5 w-5" />
                    Próximas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-900">
                    {tasks.filter((t) => t.status === "upcoming").length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Vencidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-900">
                    {tasks.filter((t) => t.status === "overdue").length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tasks by Frequency */}
            {Object.entries(groupedTasks).map(
              ([frequency, frequencyTasks]) =>
                frequencyTasks.length > 0 && (
                  <div key={frequency} className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {frequency}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {frequencyTasks.map((task) => {
                        const Icon = task.icon
                        return (
                          <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5 text-blue-600" />
                                  <CardTitle className="text-base">{task.name}</CardTitle>
                                </div>
                                <Badge variant="outline" className={getStatusColor(task.status)}>
                                  {getStatusIcon(task.status)}
                                </Badge>
                              </div>
                              <CardDescription>{task.frequency}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {task.id === 1 && lastPumpChange && (
                                <p className="text-sm text-slate-600 mb-3">
                                  Última: {new Date(lastPumpChange).toLocaleDateString()}
                                </p>
                              )}
                              {task.id === 11 && lastFumigation && (
                                <p className="text-sm text-slate-600 mb-3">
                                  Última: {new Date(lastFumigation).toLocaleDateString()}
                                </p>
                              )}
                              {task.lastCompleted && task.id !== 1 && task.id !== 11 && (
                                <p className="text-sm text-slate-600 mb-3">Última: {task.lastCompleted}</p>
                              )}
                              <Button
                                onClick={() => handleCompleteTask(task.id)}
                                disabled={task.status === "completed"}
                                className="w-full"
                                variant={task.status === "completed" ? "outline" : "default"}
                              >
                                {task.status === "completed" ? "Completada" : "Completar"}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ),
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Tareas</CardTitle>
                <CardDescription>Tareas programadas para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Vista de calendario próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Historial de Cambio de Bombas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/cambio-bombas`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Historial de Fumigación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/${hotel}/preventivo/fumigacion`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={pumpDialogOpen} onOpenChange={setPumpDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cambio de Bombas</DialogTitle>
              <DialogDescription>Registra el cambio de bomba semanal</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Selecciona la bomba</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={selectedPump === 1 ? "default" : "outline"}
                    onClick={() => setSelectedPump(1)}
                    className="flex-1"
                  >
                    Bomba 1
                  </Button>
                  <Button
                    variant={selectedPump === 2 ? "default" : "outline"}
                    onClick={() => setSelectedPump(2)}
                    className="flex-1"
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
                <Button onClick={handlePumpChangeSubmit} className="flex-1">
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setPumpDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={fumigationDialogOpen} onOpenChange={setFumigationDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fumigación de Chinches</DialogTitle>
              <DialogDescription>Registra la fumigación trimestral de habitaciones</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Fecha de Fumigación</Label>
                <Input
                  type="date"
                  value={fumigationDate}
                  onChange={(e) => setFumigationDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Habitaciones Fumigadas ({selectedRooms.length} seleccionadas)</Label>
                <div className="grid grid-cols-6 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded">
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
                <Button variant="outline" size="sm" onClick={() => setSelectedRooms(rooms)} className="mt-2 mr-2">
                  Seleccionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedRooms([])} className="mt-2">
                  Limpiar Selección
                </Button>
              </div>

              <div>
                <Label htmlFor="fumOperator">Responsable *</Label>
                <Input
                  id="fumOperator"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Nombre del responsable o empresa"
                />
              </div>

              <div>
                <Label htmlFor="fumObservations">Observaciones</Label>
                <Textarea
                  id="fumObservations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Producto utilizado, incidencias, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleFumigationSubmit} className="flex-1">
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setFumigationDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
