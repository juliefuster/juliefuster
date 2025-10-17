"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Search, Wind } from "lucide-react"

interface FilterCleaningRecord {
  id: string
  hotel: string
  cleaned_filters: string[]
  operator_name: string
  observations: string | null
  created_at: string
}

export default function FilterCleaningHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string
  const [records, setRecords] = useState<FilterCleaningRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FilterCleaningRecord[]>([])
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
        r.cleaned_filters?.some((filter) => filter.toLowerCase().includes(term))
    )
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/filter-cleaning?hotel=${hotel}`)
      if (!response.ok) throw new Error("Failed to fetch records")
      const data = await response.json()
      setRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error("Error fetching filter cleaning records:", error)
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
              <Wind className="h-6 w-6 text-blue-600" />
              Historial de Limpieza de Filtros
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
            placeholder="Buscar por operario, filtro u observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Tabla */}
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
                    <TableHead>Filtros Limpiados</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(record.created_at)}
                      </TableCell>
                      <TableCell>{record.operator_name || "—"}</TableCell>
                      <TableCell>
                        {record.cleaned_filters && record.cleaned_filters.length > 0 ? (
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
                        {record.cleaned_filters && record.cleaned_filters.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                            Limpio
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
