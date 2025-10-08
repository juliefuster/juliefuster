"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Search, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

type FilterCleaningRecord = {
  id: number
  hotel: string
  cleanedFilters: string[]
  operatorName: string
  observations: string | null
  cleanedAt: string
}

export default function FilterCleaningHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi" 
  const [records, setRecords] = useState<FilterCleaningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterOperator, setFilterOperator] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/filter-cleaning?hotel=${hotel}`)
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cleanedFilters.some((filter) => filter.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.observations && record.observations.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate = filterDate === "" || new Date(record.cleanedAt).toISOString().split("T")[0] === filterDate

    const matchesOperator =
      filterOperator === "" || record.operatorName.toLowerCase().includes(filterOperator.toLowerCase())

    return matchesSearch && matchesDate && matchesOperator
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              <h1 className="text-2xl font-bold text-slate-900">Historial de Limpieza de Filtros</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Operario, filtro, observaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Operario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nombre del operario"
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Mostrando {filteredRecords.length} de {records.length} registros
          </p>
        </div>

        {/* Records */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <p className="text-slate-500">No se encontraron registros</p>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {new Date(record.cleanedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Badge>
                      <Badge variant="outline">{record.operatorName}</Badge>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Filtros limpiados ({record.cleanedFilters.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {record.cleanedFilters.map((filter, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {record.observations && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Observaciones:</strong> {record.observations}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(record.cleanedAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
