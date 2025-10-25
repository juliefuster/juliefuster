"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Eye, CheckCircle2, AlertTriangle, Filter } from "lucide-react"

interface FilterCleaningRecord {
  id: string
  hotel: string
  cleaned_filters: string[]
  operator_name: string
  observations: string | null
  created_at: string
  next_date?: string | null
}

interface RoomStatus {
  room: string
  status: "limpia" | "sucia"
  days: number
  next_date: string | null
}

export default function FilterCleaningHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string

  const [records, setRecords] = useState<FilterCleaningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showStatusView, setShowStatusView] = useState(true) // 👈 Vista rápida primero
  const [roomStatus, setRoomStatus] = useState<RoomStatus[]>([])
  const [showOnlyDirty, setShowOnlyDirty] = useState(true) // 👈 Mostrar solo sucias por defecto

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/filter-cleaning?hotel=${hotel}`)
      if (!response.ok) throw new Error("Failed to fetch records")
      const data = await response.json()
      setRecords(data)
      calculateRoomStatus(data)
    } catch (error) {
      console.error("Error fetching filter cleaning records:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRoomStatus = (records: FilterCleaningRecord[]) => {
    const now = new Date()
    const roomMap: Record<string, RoomStatus> = {}

    records.forEach((record) => {
      const cleaned = record.cleaned_filters || []
      const next = record.next_date ? new Date(record.next_date) : null

      cleaned.forEach((room) => {
        if (!roomMap[room] || new Date(record.created_at) > new Date(roomMap[room].next_date || 0)) {
          const diffDays = next
            ? Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0
          const status = diffDays >= 0 ? "limpia" : "sucia"
          roomMap[room] = {
            room,
            status,
            days: Math.abs(diffDays),
            next_date: record.next_date || null,
          }
        }
      })
    })

    setRoomStatus(Object.values(roomMap).sort((a, b) => a.room.localeCompare(b.room)))
  }

  const handlePrint = () => window.print()

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const filteredRooms = showOnlyDirty
    ? roomStatus.filter((r) => r.status === "sucia")
    : roomStatus

  const totalClean = roomStatus.filter((r) => r.status === "limpia").length
  const totalDirty = roomStatus.filter((r) => r.status === "sucia").length

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="print:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historial de Limpieza de Filtros</h1>
            <p className="text-muted-foreground">
              Hotel {hotel.charAt(0).toUpperCase() + hotel.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          {showStatusView && (
            <Button
              variant={showOnlyDirty ? "default" : "outline"}
              onClick={() => setShowOnlyDirty(!showOnlyDirty)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showOnlyDirty ? "Ver todas" : "Ver solo sucias"}
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowStatusView(!showStatusView)}>
            <Eye className="h-4 w-4 mr-2" />
            {showStatusView ? "Ver Historial" : "Vista rápida"}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* 🔹 VISTA RÁPIDA DE ESTADO DE FILTROS (por defecto) */}
      {showStatusView && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Filtros por Habitación</CardTitle>
            <CardDescription>
              Visualiza qué habitaciones tienen filtros limpios o sucios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 🔸 Resumen */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{totalClean} habitaciones limpias</span>
              </div>
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">{totalDirty} habitaciones sucias</span>
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {showOnlyDirty
                  ? "No hay habitaciones sucias actualmente 😎"
                  : "No hay datos de estado de filtros"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Habitación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Próxima limpieza</TableHead>
                      <TableHead>Días restantes / en retraso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => {
                      const totalCycle = 14
                      const days = Math.min(room.days, totalCycle)
                      const percentage =
                        room.status === "limpia"
                          ? ((totalCycle - days) / totalCycle) * 100
                          : 100

                      return (
                        <TableRow key={room.room}>
                          <TableCell className="font-medium">{room.room}</TableCell>

                          {/* Estado */}
                          <TableCell>
                            {room.status === "limpia" ? (
                              <span className="flex items-center text-green-700 font-medium">
                                <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Limpia
                              </span>
                            ) : (
                              <span className="flex items-center text-red-700 font-medium">
                                <AlertTriangle className="h-4 w-4 mr-1 text-red-600" /> Sucia
                              </span>
                            )}
                          </TableCell>

                          {/* Próxima limpieza */}
                          <TableCell>
                            {room.next_date
                              ? new Date(room.next_date).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "-"}
                          </TableCell>

                          {/* Días */}
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    room.status === "limpia" ? "bg-green-500" : "bg-red-500"
                                  }`}
                                  style={{
                                    width:
                                      room.status === "limpia"
                                        ? `${100 - percentage}%`
                                        : "100%",
                                  }}
                                />
                              </div>
                              <div className="text-xs text-slate-600 flex justify-between">
                                {room.status === "limpia" ? (
                                  <>
                                    <span>🧼 Faltan</span>
                                    <span className="font-semibold text-green-700">{room.days} días</span>
                                  </>
                                ) : (
                                  <>
                                    <span>⚠️ Retraso</span>
                                    <span className="font-semibold text-red-700">{room.days} días</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🔹 HISTORIAL DE LIMPIEZAS */}
      {!showStatusView && (
        <Card>
          <CardHeader>
            <CardTitle>Registros de Limpieza</CardTitle>
            <CardDescription>
              Historial completo de limpiezas de filtros de aire acondicionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando registros...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay registros de limpieza de filtros
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operario</TableHead>
                      <TableHead>Filtros Limpiados</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(record.created_at)}</TableCell>
                        <TableCell>{record.operator_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.cleaned_filters.map((filter, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                              >
                                {filter}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">{record.observations || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
