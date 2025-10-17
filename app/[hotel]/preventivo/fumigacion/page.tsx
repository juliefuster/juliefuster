"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Bug } from "lucide-react"

interface FumigationRecord {
  id: string
  hotel: string
  date: string
  operator_name: string
  observations: string | null
  rooms: string[] | null
}

export default function FumigationHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string
  const [records, setRecords] = useState<FumigationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fumigation?hotel=${hotel}`)
      if (!response.ok) throw new Error("Failed to fetch records")

      const data = await response.json()

      // Normaliza datos
      const formatted = data.map((r: any) => {
        // Detecta habitaciones en el campo "observations"
        let extractedRooms: string[] = []
        let cleanedObservations = r.observations || ""

        const match = cleanedObservations.match(/habitaciones\s+fumigadas:\s*([0-9,\s]+)/i)
        if (match) {
          extractedRooms = match[1]
            .split(",")
            .map((room: string) => room.trim())
            .filter(Boolean)
          // Elimina esa parte del texto para dejar solo las observaciones reales
          cleanedObservations = cleanedObservations.replace(match[0], "").trim()
        }

        // Si la tabla ya tiene un campo "rooms" (jsonb)
        const parsedRooms =
          typeof r.rooms === "string" && r.rooms.startsWith("[")
            ? JSON.parse(r.rooms)
            : Array.isArray(r.rooms)
            ? r.rooms
            : extractedRooms

        return {
          ...r,
          rooms: parsedRooms,
          observations: cleanedObservations || null,
        }
      })

      setRecords(formatted)
    } catch (error) {
      console.error("Error fetching fumigation records:", error)
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de fumigación
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
