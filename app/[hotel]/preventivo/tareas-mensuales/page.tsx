"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Printer, Calendar, User, Download, Search, Eye, CheckCircle2, AlertTriangle, Filter } from "lucide-react"

interface MonthlyTaskRecord {
  id: number
  hotel: string
  task_id: number
  task_name: string
  operator_name: string
  observations: string | null
  date: string
  next_date: string | null
}

interface TaskStatus {
  taskName: string
  status: "completada" | "pendiente"
  days: number
  next_date: string | null
  lastDate: string
}

export default function MonthlyTasksHistoryPage() {
  const params = useParams()
  const hotel = params.hotel as string
  const [records, setRecords] = useState<MonthlyTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("Todos")
  const [showStatusView, setShowStatusView] = useState(true)
  const [taskStatus, setTaskStatus] = useState<TaskStatus[]>([])
  const [showOnlyPending, setShowOnlyPending] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/monthly-tasks?hotel=${hotel}`)
      if (!response.ok) throw new Error("Error fetching records")
      const data = await response.json()
      setRecords(data)
      calculateTaskStatus(data)
    } catch (error) {
      console.error("Error fetching monthly task records:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTaskStatus = (records: MonthlyTaskRecord[]) => {
    const now = new Date()
    const taskMap: Record<string, TaskStatus> = {}

    records.forEach((record) => {
      const taskName = record.task_name
      const next = record.next_date ? new Date(record.next_date) : null
      const recordDate = new Date(record.date)

      if (!taskMap[taskName] || recordDate > new Date(taskMap[taskName].lastDate)) {
        const diffDays = next ? Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
        const status = diffDays >= 0 ? "completada" : "pendiente"

        taskMap[taskName] = {
          taskName,
          status,
          days: Math.abs(diffDays),
          next_date: record.next_date || null,
          lastDate: record.date,
        }
      }
    })

    setTaskStatus(Object.values(taskMap).sort((a, b) => a.taskName.localeCompare(b.taskName)))
  }

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const header = ["Fecha", "Tarea", "Operario", "Observaciones"]
    const csvRows = [header.join(",")]
    filteredRecords.forEach((r) => {
      csvRows.push(
        [
          new Date(r.date).toLocaleDateString("es-ES"),
          `"${r.task_name}"`,
          `"${r.operator_name}"`,
          `"${r.observations?.replace(/\n/g, " ") || ""}"`,
        ].join(","),
      )
    })
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Historial_Tareas_Mensuales_${hotel}.csv`
    a.click()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const groupName = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes("desag")) return "💧 Desagües"
    if (n.includes("pozo")) return "🕳️ Pozo S2"
    if (n.includes("claraboya")) return "🌤️ Claraboya"
    if (n.includes("sala de máquinas")) return "🏭 Sala de Máquinas"
    if (n.includes("marquesina")) return "🧽 Marquesina"
    if (n.includes("luces")) return "💡 Luces de Emergencia"
    if (n.includes("bajante")) return "⬇️ Bajante S1"
    if (n.includes("tubo")) return "🚒 Tubo Bombero"
    return "📋 Otras"
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.task_name.toLowerCase().includes(search.toLowerCase()) ||
        r.operator_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.observations || "").toLowerCase().includes(search.toLowerCase())

      const matchMonth =
        selectedMonth === "Todos" ||
        new Date(r.date).toLocaleString("es-ES", { month: "long" }) === selectedMonth.toLowerCase()

      return matchSearch && matchMonth
    })
  }, [records, search, selectedMonth])

  const grouped = useMemo(() => {
    const groupedData = filteredRecords.reduce(
      (acc, record) => {
        const key = groupName(record.task_name)
        if (!acc[key]) acc[key] = []
        acc[key].push(record)
        return acc
      },
      {} as Record<string, MonthlyTaskRecord[]>,
    )

    Object.keys(groupedData).forEach((key) =>
      groupedData[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    )

    return groupedData
  }, [filteredRecords])

  const groupedKeys = Object.keys(grouped)

  const allMonths = [
    "Todos",
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  const filteredTasks = showOnlyPending ? taskStatus.filter((t) => t.status === "pendiente") : taskStatus
  const totalCompleted = taskStatus.filter((t) => t.status === "completada").length
  const totalPending = taskStatus.filter((t) => t.status === "pendiente").length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Historial de Tareas Mensuales</h1>
          <p className="text-muted-foreground capitalize">Hotel: {hotel}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {showStatusView && (
            <Button
              variant={showOnlyPending ? "default" : "outline"}
              onClick={() => setShowOnlyPending(!showOnlyPending)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showOnlyPending ? "Ver todas" : "Ver solo pendientes"}
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowStatusView(!showStatusView)}>
            <Eye className="h-4 w-4 mr-2" />
            {showStatusView ? "Ver Historial" : "Vista rápida"}
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {showStatusView ? (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Tareas Mensuales</CardTitle>
            <CardDescription>Visualiza qué tareas están completadas o pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{totalCompleted} tareas completadas</span>
              </div>
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-sm">
                <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                <span className="text-sm font-medium">{totalPending} tareas pendientes</span>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {showOnlyPending ? "No hay tareas pendientes 😎" : "No hay datos de tareas mensuales"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Próxima ejecución</TableHead>
                      <TableHead>Días restantes / en retraso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.taskName}>
                        <TableCell className="font-medium">{groupName(task.taskName)}</TableCell>
                        <TableCell>
                          {task.status === "completada" ? (
                            <span className="flex items-center text-green-700 font-medium">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Completada
                            </span>
                          ) : (
                            <span className="flex items-center text-red-700 font-medium">
                              <AlertTriangle className="h-4 w-4 mr-1 text-red-600" /> Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.next_date
                            ? new Date(task.next_date).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  task.status === "completada" ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{
                                  width: task.status === "completada" ? `${100 - (task.days / 30) * 100}%` : "100%",
                                }}
                              />
                            </div>
                            <div className="text-xs text-slate-600 flex justify-between">
                              {task.status === "completada" ? (
                                <>
                                  <span>📅 Próx. en</span>
                                  <span className="font-semibold text-green-700">{task.days} días</span>
                                </>
                              ) : (
                                <>
                                  <span>⚠️ Retraso</span>
                                  <span className="font-semibold text-red-700">{task.days} días</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por tarea, operario o observación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>
                Registros Completados{" "}
                <span className="text-slate-500 text-sm ml-2">({filteredRecords.length} en total)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay registros de tareas mensuales</p>
              ) : (
                <div className="space-y-10">
                  {groupedKeys.map((group) => (
                    <div key={group}>
                      <h2 className="text-lg font-semibold bg-slate-50 border-l-4 border-blue-500 px-3 py-2 flex justify-between items-center rounded">
                        <span>{group}</span>
                        <span className="text-slate-500 text-sm">{grouped[group].length} registros</span>
                      </h2>

                      <div className="overflow-x-auto mt-2 border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-100">
                              <TableHead className="w-1/6">
                                <Calendar className="inline mr-2 h-4 w-4" />
                                Fecha
                              </TableHead>
                              <TableHead className="w-1/6">
                                <User className="inline mr-2 h-4 w-4" />
                                Operario
                              </TableHead>
                              <TableHead className="w-2/3">Observaciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grouped[group].map((r) => (
                              <TableRow key={r.id}>
                                <TableCell className="text-sm whitespace-nowrap">{formatDate(r.date)}</TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                  <Badge variant="secondary">{r.operator_name}</Badge>
                                </TableCell>
                                <TableCell
                                  className="text-xs text-slate-700 truncate max-w-[500px]"
                                  title={r.observations || ""}
                                >
                                  {r.observations || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            font-size: 10px;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
