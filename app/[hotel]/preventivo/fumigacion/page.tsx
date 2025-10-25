"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Eye, Bug, Search, CheckCircle2, AlertTriangle, Filter } from "lucide-react"

interface FumigationRecord {
  id: string
  hotel: string
  date: string
  operator_name: string
  observations: string | null
  rooms: string[]
  next_date?: string | null
}

interface RoomStatus {
  room: string
  status: "fumigada" | "pendiente"
  days: number
  next_date: string | null
}

export default function FumigationHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string

  const [records, setRecords] = useState<FumigationRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FumigationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showStatusView, setShowStatusView] = useState(true)
  const [roomStatus, setRoomStatus] = useState<RoomStatus[]>([])
  const [showOnlyPending, setShowOnlyPending] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records)
      return
    }
    const term = searchTerm.toLowerCase()
    const filtered = records.filter(
      (r) =>
        r.operator_name?.toLowerCase().includes(term) ||
        (r.observations ?? "").toLowerCase().includes(term) ||
        r.rooms?.some((room) => room.toLowerCase().includes(term)),
    )
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  // 🔹 Cargar registros desde el backend
  const fetchRecords = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/fumigation?hotel=${hotel}`)

      // ✅ Aceptar tanto 200 como 201 como válidos
      if (response.status !== 200 && response.status !== 201) {
        const errorText = await response.text()
        console.error("[v2] Error al obtener registros:", errorText)
        throw new Error("Error al obtener registros de fumigación")
      }

      const data = await response.json()

      const formatted = data.map((r: any) => {
        let parsedRooms: string[] = []

        if (r.rooms) {
          try {
            // Si viene en JSON, lo parseamos
            const parsed = JSON.parse(r.rooms)
            parsedRooms = Array.isArray(parsed)
              ? parsed
              : String(r.rooms)
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
          } catch {
            // Si no es JSON, limpiamos el texto
            parsedRooms = String(r.rooms)
              .replace(/[\[\]"]/g, "")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          }
        }

        return {
          id: r.id,
          hotel: r.hotel,
          date: r.date,
          operator_name: r.operator_name,
          observations: r.observations || null,
          rooms: parsedRooms,
          next_date: r.next_date || null,
        }
      })

      console.log(`[v2] Registros de fumigación cargados: ${formatted.length}`)
      setRecords(formatted)
      setFilteredRecords(formatted)
      calculateRoomStatus(formatted)
    } catch (error) {
      console.error("💥 Error fetching fumigation records:", error)
    } finally {
      setLoading(false)
    }
  }

  // 🔸 Calcular estado por habitación
  const calculateRoomStatus = (records: FumigationRecord[]) => {
    const now = new Date()
    const roomMap: Record<string, RoomStatus> = {}

    records.forEach((record) => {
      const rooms = record.rooms || []
      const next = record.next_date ? new Date(record.next_date) : null

      rooms.forEach((room) => {
        if (!roomMap[room] || new Date(record.date) > new Date(roomMap[room].next_date || 0)) {
          const diffDays = next ? Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
          const status = diffDays >= 0 ? "fumigada" : "pendiente"
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

  const filteredRooms = showOnlyPending ? roomStatus.filter((r) => r.status === "pendiente") : roomStatus
  const totalFumigated = roomStatus.filter((r) => r.status === "fumigada").length
  const totalPending = roomStatus.filter((r) => r.status === "pendiente").length

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="print:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bug className="h-6 w-6 text-purple-600" />
              Historial de Fumigaciones
            </h1>
            <p className="text-muted-foreground">Hotel {hotel.charAt(0).toUpperCase() + hotel.slice(1)}</p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
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
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* 🔹 Vista rápida */}
      {showStatusView ? (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Fumigaciones por Habitación</CardTitle>
            <CardDescription>Visualiza qué habitaciones están fumigadas o pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{totalFumigated} habitaciones fumigadas</span>
              </div>
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">{totalPending} habitaciones pendientes</span>
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {showOnlyPending ? "No hay habitaciones pendientes 😎" : "No hay datos de fumigación"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Habitación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Próxima fumigación</TableHead>
                      <TableHead>Días restantes / en retraso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.room}>
                        <TableCell className="font-medium">{room.room}</TableCell>
                        <TableCell>
                          {room.status === "fumigada" ? (
                            <span className="flex items-center text-green-700 font-medium">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Fumigada
                            </span>
                          ) : (
                            <span className="flex items-center text-red-700 font-medium">
                              <AlertTriangle className="h-4 w-4 mr-1 text-red-600" /> Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {room.next_date
                            ? new Date(room.next_date).toLocaleDateString("es-ES", {
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
                                  room.status === "fumigada" ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{
                                  width: room.status === "fumigada"
                                    ? `${100 - (room.days / 90) * 100}%`
                                    : "100%",
                                }}
                              />
                            </div>
                            <div className="text-xs text-slate-600 flex justify-between">
                              {room.status === "fumigada" ? (
                                <>
                                  <span>🪳 Próx. en</span>
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="p-4 mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-500" />
              <Input
                placeholder="Buscar por operario, habitación u observación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros de Fumigación</CardTitle>
              <CardDescription>Historial completo de fumigaciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando registros...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No se encontraron registros</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Operario</TableHead>
                        <TableHead>Habitaciones</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{record.operator_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {record.rooms.map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-medium"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{record.observations || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 🔹 Estilos de impresión */}
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
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
