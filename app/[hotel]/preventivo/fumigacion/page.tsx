"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Bug, Search } from "lucide-react"

interface FumigationRecord {
  id: string
  hotel: string
  date: string
  operator_name: string
  observations: string | null
  rooms: string[]
}

export default function FumigationHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string

  const [records, setRecords] = useState<FumigationRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FumigationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
        r.rooms?.some((room) => room.toLowerCase().includes(term))
    )
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fumigation?hotel=${hotel}`)
      if (!response.ok) throw new Error("Failed to fetch records")

      const data = await response.json()
      const formatted = data.map((r: any) => {
        let extractedRooms: string[] = []
        let cleanedObservations = r.observations || ""

        const match = cleanedObservations.match(/habitaciones\s+fumigadas:\s*([0-9,\s]+)/i)
        if (match) {
          extractedRooms = match[1]
            .split(",")
            .map((room: string) => room.trim())
            .filter(Boolean)
          cleanedObservations = cleanedObservations.replace(match[0], "").trim()
        }

        const parsedRooms =
          typeof r.rooms === "string" && r.rooms.startsWith("[")
            ? JSON.parse(r.rooms)
            : Array.isArray(r.rooms)
            ? r.rooms
            : extractedRooms

        return {
          id: r.id,
          hotel: r.hotel,
          date: r.date,
          operator_name: r.operator_name,
          observations: cleanedObservations || null,
          rooms: parsedRooms || [],
        }
      })
      setRecords(formatted)
      setFilteredRecords(formatted)
    } catch (error) {
      console.error("Error fetching fumigation records:", error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
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
            <p className="text-muted-foreground">
              Hotel {hotel.charAt(0).toUpperCase() + hotel.slice(1)}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Buscador */}
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

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Fumigación</CardTitle>
          <CardDescription>
            Historial completo de fumigaciones realizadas en el hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando registros...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron registros
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Operario</TableHead>
                    <TableHead>Habitaciones Fumigadas</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>{record.operator_name || "—"}</TableCell>
                      <TableCell>
                        {record.rooms && record.rooms.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {record.rooms.map((room, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-medium"
                              >
                                {room}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {record.observations && record.observations.trim() !== ""
                          ? record.observations
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {record.rooms && record.rooms.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                            Fumigada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                            Pendiente
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estilo para impresión */}
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
