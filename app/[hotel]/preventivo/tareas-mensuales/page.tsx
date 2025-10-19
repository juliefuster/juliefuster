"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Printer, Calendar, User, FileText } from "lucide-react"

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

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 🔹 Agrupar por tipo de tarea
  const grouped = records.reduce((acc, record) => {
    const key =
      record.task_name.toLowerCase().includes("desag")
        ? "Desagües"
        : record.task_name.toLowerCase().includes("pozo")
        ? "Pozo S2"
        : record.task_name.toLowerCase().includes("claraboya")
        ? "Claraboya"
        : record.task_name.toLowerCase().includes("sala de máquinas")
        ? "Sala de Máquinas"
        : record.task_name.toLowerCase().includes("marquesina")
        ? "Marquesina"
        : record.task_name.toLowerCase().includes("luces")
        ? "Luces de Emergencia"
        : record.task_name.toLowerCase().includes("bajante")
        ? "Bajante S1"
        : record.task_name.toLowerCase().includes("tubo")
        ? "Tubo Bombero"
        : "Otras"

    if (!acc[key]) acc[key] = []
    acc[key].push(record)
    return acc
  }, {} as Record<string, MonthlyTaskRecord[]>)

  const groupedKeys = Object.keys(grouped)

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
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Historial de Tareas Mensuales</h1>
          <p className="text-muted-foreground">Hotel: {hotel.charAt(0).toUpperCase() + hotel.slice(1)}</p>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Tarjeta principal */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Tareas Completadas</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay registros de tareas mensuales</p>
          ) : (
            <div className="space-y-8">
              {groupedKeys.map((group) => (
                <div key={group}>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {group}
                  </h2>
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100">
                          <TableHead className="px-2 py-3 w-1/5">
                            <Calendar className="inline mr-2 h-4 w-4" />
                            Fecha
                          </TableHead>
                          <TableHead className="px-2 py-3 w-1/5">
                            <User className="inline mr-2 h-4 w-4" />
                            Operario
                          </TableHead>
                          <TableHead className="px-2 py-3 w-3/5">Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grouped[group].map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="px-2 py-3 text-sm whitespace-nowrap">
                              {formatDate(record.date)}
                            </TableCell>
                            <TableCell className="px-2 py-3 text-sm">
                              <Badge variant="secondary">{record.operator_name}</Badge>
                            </TableCell>
                            <TableCell className="px-2 py-3 text-xs whitespace-normal">
                              {record.observations || "-"}
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
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
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
