"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, ArrowLeft, CheckCircle, AlertCircle, Clock, FileText, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { RoomInspectionModal } from "@/components/room-inspection-modal"
import { exportReportToPDF } from "@/lib/export-report"
import { exportReportToExcel } from "@/lib/export-excel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Room {
  id: string
  hotel: string
  room_number: string
  floor: number
  is_common_area: boolean
}

interface RoomStatus {
  room_number: string
  status: "complete" | "pending" | "not_inspected"
  lastInspection?: string
}

export default function RoomInspectionPage() {
  const params = useParams()
  const hotel = (params?.hotel as string) || "chi"
  const hotelName = hotel.toLowerCase() === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const supabase = createClient()

  const [rooms, setRooms] = useState<Room[]>([])
  const [roomStatuses, setRoomStatuses] = useState<Record<string, RoomStatus>>({})
  const [selectedFloor, setSelectedFloor] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"complete" | "pending" | "not_inspected" | null>(
    null,
  )

  useEffect(() => {
    fetchRooms()
  }, [hotel])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("hotel_rooms")
        .select("*")
        .ilike("hotel", `%${hotel}%`)
        .order("floor", { ascending: true })
        .order("room_number", { ascending: true })

      if (error) throw error

      setRooms(data || [])

      if (data && data.length > 0) {
        const floors = Array.from(
          new Set(data.map((r) => r.floor).filter((f) => f !== null && f !== undefined && !isNaN(f))),
        ).sort((a, b) => a - b)

        if (floors.length > 0) {
          setSelectedFloor(String(floors[0]))
        } else {
          setSelectedFloor("none")
        }

        await fetchRoomStatuses(data)
      } else {
        setSelectedFloor("none")
        setRoomStatuses({})
      }
    } catch (error) {
      console.error("Error al cargar habitaciones:", error)
      setSelectedFloor("none")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomStatuses = async (roomsList: Room[]) => {
    const statuses: Record<string, RoomStatus> = {}

    for (const room of roomsList) {
      const { data, error } = await supabase
        .from("room_inspections")
        .select("status, inspected_at")
        .ilike("hotel", `%${hotel}%`)
        .eq("room_number", room.room_number)
        .order("inspected_at", { ascending: false })

      if (!error && data && data.length > 0) {
        const allCorrect = data.every((item) => item.status === "correcto" || item.status === "reparado")
        const hasPending = data.some((item) => item.status === "pendiente")

        statuses[room.room_number] = {
          room_number: room.room_number,
          status: allCorrect ? "complete" : hasPending ? "pending" : "not_inspected",
          lastInspection: data[0]?.inspected_at,
        }
      } else {
        statuses[room.room_number] = {
          room_number: room.room_number,
          status: "not_inspected",
        }
      }
    }

    setRoomStatuses(statuses)
  }

  const getStatusColor = (status: RoomStatus["status"]) => {
    switch (status) {
      case "complete":
        return "bg-green-100 border-green-500 text-green-700"
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-700"
      default:
        return "bg-slate-100 border-slate-300 text-slate-700"
    }
  }

  const getStatusIcon = (status: RoomStatus["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleCloseModal = () => {
    setSelectedRoom(null)
    fetchRoomStatuses(rooms)
  }

  const handleExportPDF = async () => {
    const { data, error } = await supabase.from("room_inspections").select("*").ilike("hotel", `%${hotel}%`)

    if (!error && data) {
      await exportReportToPDF(hotel, data)
    } else {
      console.error("Error al exportar PDF:", error)
    }
  }

  const handleExportExcel = async () => {
    const { data, error } = await supabase.from("room_inspections").select("*").ilike("hotel", `%${hotel}%`)

    if (!error && data) {
      await exportReportToExcel(hotel, data)
    } else {
      console.error("Error al exportar Excel:", error)
    }
  }

  const handleStatusClick = (status: "complete" | "pending" | "not_inspected") => {
    setSelectedStatusFilter(status)
  }

  const getFilteredRooms = () => {
    if (!selectedStatusFilter) return []

    return rooms.filter((room) => {
      const status = roomStatuses[room.room_number]
      return status && status.status === selectedStatusFilter
    })
  }

  const getStatusLabel = (status: "complete" | "pending" | "not_inspected") => {
    switch (status) {
      case "complete":
        return "Completas"
      case "pending":
        return "Pendientes"
      case "not_inspected":
        return "Sin revisar"
    }
  }

  const floors = Array.from(
    new Set(rooms.map((r) => r.floor).filter((f) => f !== null && f !== undefined && !isNaN(f))),
  ).sort((a, b) => a - b)

  const shouldRenderTabs = !loading && floors.length > 0 && selectedFloor !== "none"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-3">
          <Link href={`/${hotel}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="p-2 bg-purple-600 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revisión de Habitaciones</h1>
            <p className="text-sm text-slate-600">{hotelName}</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p className="text-center text-slate-600 py-12">Cargando habitaciones...</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-slate-600 py-12">No hay habitaciones registradas para este hotel.</p>
        ) : !shouldRenderTabs ? (
          <p className="text-center text-slate-600 py-12">No hay plantas disponibles para mostrar.</p>
        ) : (
          <>
            {/* Tabs */}
            <Tabs value={selectedFloor} onValueChange={(v) => setSelectedFloor(v)}>
              <TabsList className="mb-6 flex flex-wrap gap-2">
                {floors.map((floor) => (
                  <TabsTrigger key={floor} value={String(floor)}>
                    Planta {floor}
                  </TabsTrigger>
                ))}
              </TabsList>

              {floors.map((floor) => {
                const roomsByFloor = rooms.filter((r) => r.floor === floor)
                return (
                  <TabsContent key={floor} value={String(floor)}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {roomsByFloor.map((room) => {
                        const status = roomStatuses[room.room_number]
                        return (
                          <Card
                            key={room.id}
                            className={`p-4 cursor-pointer hover:shadow-lg transition-all border-2 ${
                              status ? getStatusColor(status.status) : "bg-slate-100 border-slate-300"
                            }`}
                            onClick={() => handleRoomClick(room)}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              {status && getStatusIcon(status.status)}
                              <span className="text-lg font-bold">{room.room_number}</span>
                              {room.is_common_area && (
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded">Zona común</span>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleStatusClick("complete")}
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Completas</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Object.values(roomStatuses).filter((s) => s.status === "complete").length}
                  </p>
                </div>
              </Card>

              <Card
                className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleStatusClick("pending")}
              >
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-slate-600">Pendientes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Object.values(roomStatuses).filter((s) => s.status === "pending").length}
                  </p>
                </div>
              </Card>

              <Card
                className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleStatusClick("not_inspected")}
              >
                <Clock className="h-8 w-8 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Sin revisar</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Object.values(roomStatuses).filter((s) => s.status === "not_inspected").length}
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Button onClick={handleExportPDF} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar informe a PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2 bg-transparent">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {selectedRoom && <RoomInspectionModal room={selectedRoom} hotel={hotel} onClose={handleCloseModal} />}

      {/* Status Filter Dialog */}
      <Dialog open={selectedStatusFilter !== null} onOpenChange={() => setSelectedStatusFilter(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStatusFilter === "complete" && <CheckCircle className="h-5 w-5 text-green-600" />}
              {selectedStatusFilter === "pending" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
              {selectedStatusFilter === "not_inspected" && <Clock className="h-5 w-5 text-slate-400" />}
              Habitaciones {selectedStatusFilter && getStatusLabel(selectedStatusFilter)}
            </DialogTitle>
            <DialogDescription>
              Lista de habitaciones con estado:{" "}
              {selectedStatusFilter && getStatusLabel(selectedStatusFilter).toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {getFilteredRooms().length === 0 ? (
              <p className="text-center text-slate-600 py-8">No hay habitaciones con este estado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última inspección</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredRooms().map((room) => {
                    const status = roomStatuses[room.room_number]
                    return (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.room_number}</TableCell>
                        <TableCell>Planta {room.floor}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              status?.status === "complete"
                                ? "bg-green-100 text-green-700"
                                : status?.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {status?.status === "complete" && "Completa"}
                            {status?.status === "pending" && "Pendiente"}
                            {status?.status === "not_inspected" && "Sin revisar"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {status?.lastInspection
                            ? new Date(status.lastInspection).toLocaleDateString("es-ES")
                            : "Nunca"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStatusFilter(null)
                              handleRoomClick(room)
                            }}
                          >
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
