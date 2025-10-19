"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Printer, Calendar, User, FileText, Download, Search } from "lucide-react"

interface MonthlyTaskRecord {
  id: number
  hotel: string
  task_id: number
  task_name: string
  operator_name: string
  observations: string | null
  date: string
}

export default function MonthlyTasksHistoryPage() {
  const params = useParams()
  const hotel = params.hotel as string
  const [records, setRecords] = useState<MonthlyTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("Todos")

  // 📦 Fetch inicial
  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/monthly-tasks?hotel=${hotel}`)
      if (!response.ok) throw new Error("Error fetching records")
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching monthly task records:", error)
    } finally {
      setLoading(false)
    }
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

  // 🧩 Agrupación inteligente
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

  // 🔎 Búsqueda y filtro por mes
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

  // 🔹 Agrupar y ordenar descendente por fecha
  const grouped = useMemo(() => {
    const groupedData = filteredRecords.reduce((acc, record) => {
      const key = groupName(record.task_name)
      if (!acc[key]) acc[key] = []
      acc[key].push(record)
      return acc
    }, {} as Record<string, MonthlyTaskRecord[]>)

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
            <span className="text-slate-500 text-sm ml-2">
              ({filteredRecords.length} en total)
            </span>
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
                    <span className="text-slate-500 text-sm">
                      {grouped[group].length} registros
                    </span>
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
                            <TableCell className="text-xs text-slate-700 truncate max-w-[500px]" title={r.observations || ""}>
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
