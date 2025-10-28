"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, User, Package, FileText } from "lucide-react"

const TASK_NAMES: Record<string, string> = {
  aire_acondicionado: "Revisión de Aire Acondicionado",
  grupo_electrogeno: "Grupo Electrógeno",
  alarma_extintores: "Alarma y Extintores",
  control_legionela: "Control de Legionela",
  control_plagas: "Control de Plagas",
  ascensor_montacargas: "Revisión Ascensor y Montacargas",
}

export default function ExternalMaintenanceHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const taskType = params.taskType as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel
  const taskName = TASK_NAMES[taskType] || "Mantenimiento Externo"

  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`/api/external-maintenance?hotel=${hotel}&taskType=${taskType}`)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setRecords(data.records || [])
        setError(null)
      } catch (error) {
        console.error("Error fetching records:", error)
        setError("No se pudieron cargar los registros. La tabla puede no existir aún.")
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [hotel, taskType])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Historial: {taskName}</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Cargando historial...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-slate-500">
                Por favor, ejecuta el script SQL para crear la tabla external_maintenance_records
              </p>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No hay registros de {taskName.toLowerCase()} aún</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {new Date(record.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Registrado el {new Date(record.created_at).toLocaleDateString("es-ES")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.work_done && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1">Trabajo realizado:</h3>
                      <p className="text-sm text-slate-600">{record.work_done}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Operario:
                      </h3>
                      <p className="text-sm text-slate-600">{record.operator_name}</p>
                    </div>

                    {record.hotel_person_present && (
                      <div>
                        <h3 className="font-semibold text-sm text-slate-700 mb-1">Persona del hotel:</h3>
                        <p className="text-sm text-slate-600">{record.hotel_person_present}</p>
                      </div>
                    )}
                  </div>

                  {record.replacement_materials && record.replacement_materials.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Material de repuesto:
                      </h3>
                      <div className="space-y-1">
                        {record.replacement_materials.map((material: any, index: number) => (
                          <div key={index} className="text-sm text-slate-600 flex gap-2">
                            <span className="font-medium">Cantidad: {material.quantity}</span>
                            <span>•</span>
                            <span>Ref: {material.reference}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.observations && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Observaciones:
                      </h3>
                      <p className="text-sm text-slate-600">{record.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
