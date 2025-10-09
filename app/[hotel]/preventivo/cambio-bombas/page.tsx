"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Wrench, Printer, Droplets } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface PumpChangeRecord {
  id: string
  hotel: string
  date: string
  pump_number: number
  operator_name: string
  observations: string | null
  purga_realizada: boolean | null // 👈 Nueva columna
}

export default function PumpChangeHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const supabase = createClient()

  const [records, setRecords] = useState<PumpChangeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("pump_change_records")
        .select("*")
        .eq("hotel", hotel)
        .order("date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      console.error("Error cargando historial de bombas:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  // Agrupar registros por mes
  const recordsByMonth = records.reduce(
    (acc, record) => {
      const date = record.date ? new Date(record.date) : null
      if (!date || isNaN(date.getTime())) return acc

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("es-ES", { year: "numeric", month: "long" })

      if (!acc[monthKey]) acc[monthKey] = { monthName, records: [] }
      acc[monthKey].records.push(record)

      return acc
    },
    {} as Record<string, { monthName: string; records: PumpChangeRecord[] }>
  )

  const sortedMonths = Object.keys(recordsByMonth).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/${hotel}/preventivo`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Historial de Cambio de Bombas</h1>
        </div>
        <p className="text-slate-500">Cargando historial...</p>
      </div>
    )
  }

  return (
    <>
      {/* 🔹 Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .print-date {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
        }
      `}</style>

      <div className="container mx-auto p-6 print-container">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`} className="no-print">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold print-header">
                Historial de Cambio de Bombas - {hotel.charAt(0).toUpperCase() + hotel.slice(1)}
              </h1>
              <p className="text-muted-foreground">Registro completo de cambios de bombas semanales</p>
              <p className="print-date hidden print:block">
                Fecha de impresión:{" "}
                {new Date().toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} className="no-print">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Tabla */}
        {sortedMonths.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-slate-500">No hay registros de cambios de bombas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
              const { monthName, records: monthRecords } = recordsByMonth[monthKey]
              return (
                <Card key={monthKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </CardTitle>
                    <CardDescription>{monthRecords.length} cambio(s) registrado(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Nº Bomba</TableHead>
                          <TableHead>Responsable</TableHead>
                          <TableHead>Observaciones</TableHead>
                          <TableHead>Purga Realizada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthRecords.map((record) => {
                          const date = record.date ? new Date(record.date) : null
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-slate-400 no-print" />
                                  {date && !isNaN(date.getTime())
                                    ? date.toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })
                                    : "Sin fecha"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                  <Wrench className="h-3 w-3 no-print" />
                                  Bomba {record.pump_number}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-slate-400 no-print" />
                                  {record.operator_name || "Desconocido"}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-md">
                                {record.observations ? (
                                  record.observations
                                ) : (
                                  <span className="text-slate-400 italic">Sin observaciones</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {record.purga_realizada === true ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    <Droplets className="h-3 w-3" /> Sí
                                  </span>
                                ) : record.purga_realizada === false ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    <Droplets className="h-3 w-3" /> No
                                  </span>
                                ) : (
                                  <span className="italic text-slate-400">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
