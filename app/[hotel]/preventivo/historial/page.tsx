"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Wrench } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface PumpRecord {
  id: string
  hotel: string
  date: string
  pump_number: number
  operator_name: string
  observations: string | null
}

export default function PumpChangeHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const supabase = createClient()
  const [records, setRecords] = useState<PumpRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [hotel])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("pump_change_records")
        .select("*")
        .eq("hotel", hotel)
        .order("date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error al cargar historial de bombas:", error)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Función auxiliar para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Fecha inválida"
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // 🔹 Calcular el nombre del mes
  const getMonthName = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Sin mes"
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  // 🔹 Agrupar por mes
  const groupedRecords = records.reduce(
    (acc, record) => {
      const month = getMonthName(record.date)
      if (!acc[month]) acc[month] = []
      acc[month].push(record)
      return acc
    },
    {} as Record<string, PumpRecord[]>
  )

  const months = Object.keys(groupedRecords)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-6 w-6 text-green-600" />
                Historial de Cambios de Bombas
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="bg-white hover:bg-slate-50 print:hidden"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">Cargando historial...</p>
          </Card>
        ) : records.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No hay registros de cambio de bombas aún.</p>
          </Card>
        ) : (
          months.map((month) => (
            <Card
              key={month}
              className="mb-8 bg-white shadow-sm border border-slate-200 print:shadow-none print:border"
            >
              <div className="p-4 border-b bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800 capitalize flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-600" />
                  {month}
                </h2>
                <p className="text-sm text-slate-500">
                  {groupedRecords[month].length} cambio(s) registrado(s)
                </p>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="font-bold text-slate-700">Fecha</TableHead>
                      <TableHead className="font-bold text-slate-700">Nº de Bomba</TableHead>
                      <TableHead className="font-bold text-slate-700">Responsable</TableHead>
                      <TableHead className="font-bold text-slate-700">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedRecords[month].map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatDate(r.date)}</TableCell>
                        <TableCell>Bomba {r.pump_number}</TableCell>
                        <TableCell>{r.operator_name || "Sin responsable"}</TableCell>
                        <TableCell>{r.observations || "Sin observaciones"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
