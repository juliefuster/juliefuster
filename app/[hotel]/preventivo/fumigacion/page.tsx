"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Search, User, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

type FumigationRecord = {
  id: number
  hotel: string
  fumigatedRooms: string[]
  operatorName: string
  observations: string | null
  fumigatedAt: string
}

export default function FumigationHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const [records, setRecords] = useState<FumigationRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FumigationRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  useEffect(() => {
    filterRecords()
  }, [searchTerm, records])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/fumigation?hotel=${hotel}`)
      const data = await response.json()
      setRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error("Error fetching fumigation records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = records.filter(
      (record) =>
        record.operatorName.toLowerCase().includes(term) ||
        record.fumigatedRooms.some((room) => room.toLowerCase().includes(term)) ||
        (record.observations && record.observations.toLowerCase().includes(term)),
    )
    setFilteredRecords(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Historial de Fumigaciones</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por operario, habitación u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Mostrando {filteredRecords.length} de {records.length} registros
          </p>
        </div>

        {filteredRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🪳</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay registros</h3>
            <p className="text-slate-600">
              {searchTerm
                ? "No se encontraron registros con ese criterio de búsqueda"
                : "Aún no hay fumigaciones registradas"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">🪳</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="font-bold text-slate-900">
                            {new Date(record.fumigatedAt).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{record.operatorName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Habitaciones fumigadas ({record.fumigatedRooms.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {record.fumigatedRooms.map((room) => (
                          <Badge
                            key={room}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {room}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {record.observations && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Observaciones:</p>
                            <p className="text-sm text-slate-700">{record.observations}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
