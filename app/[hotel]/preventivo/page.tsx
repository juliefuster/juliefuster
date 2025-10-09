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
  const [purgePerformed, setPurgePerformed] = useState<boolean | null>(null)
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
              <CardHeader>
                <CardTitle>Calendario de Tareas</CardTitle>
                <CardDescription>Vista de tareas programadas para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vista de calendario en desarrollo</p>
                </div>
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
