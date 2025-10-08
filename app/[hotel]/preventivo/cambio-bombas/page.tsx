"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Wrench } from "lucide-react"
import Link from "next/link"

type PumpChangeRecord = {
  id: number
  hotel: string
  pumpNumber: 1 | 2
  operatorName: string
  observations: string | null
  changedAt: string
}

export default function PumpChangeHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const [records, setRecords] = useState<PumpChangeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/pump-change/history?hotel=${hotel}`)
      if (!response.ok) throw new Error("Failed to fetch records")
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching pump change records:", error)
    } finally {
      setLoading(false)
    }
  }

  // Group records by month
  const recordsByMonth = records.reduce(
    (acc, record) => {
      const date = new Date(record.changedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("es-ES", { year: "numeric", month: "long" })

      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthName,
          records: [],
        }
      }
      acc[monthKey].records.push(record)
      return acc
    },
    {} as Record<string, { monthName: string; records: PumpChangeRecord[] }>,
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
        <p className="text-muted-foreground">Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${hotel}/preventivo`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Historial de Cambio de Bombas</h1>
          <p className="text-muted-foreground">Registro completo de cambios de bombas semanales</p>
        </div>
      </div>

      {sortedMonths.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No hay registros de cambios de bombas</p>
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
                    {monthName}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthRecords
                        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                        .map((record) => {
                          const date = new Date(record.changedAt)
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {date.toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                  <span className="text-xs text-muted-foreground">
                                    {date.toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                  <Wrench className="h-3 w-3" />
                                  Bomba {record.pumpNumber}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  {record.operatorName}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-md">
                                {record.observations || (
                                  <span className="text-muted-foreground italic">Sin observaciones</span>
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
  )
}
