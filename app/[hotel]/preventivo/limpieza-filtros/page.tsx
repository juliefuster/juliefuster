"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer } from "lucide-react"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/filter-cleaning?hotel=${hotel}`)

      if (!response.ok) {
        throw new Error("Failed to fetch records")
      }

      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching filter cleaning records:", error)
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
            <h1 className="text-3xl font-bold">Historial de Limpieza de Filtros</h1>
            <p className="text-muted-foreground">Hotel {hotel.charAt(0).toUpperCase() + hotel.slice(1)}</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Limpieza</CardTitle>
          <CardDescription>Historial completo de limpiezas de filtros de aire acondicionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando registros...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay registros de limpieza de filtros</div>
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
