"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, User, Package, FileText, Wrench, Plus, DollarSign } from 'lucide-react'

const EQUIPMENT_NAMES: Record<string, string> = {
  hidrokit_lg: "Hidrokit LG",
  ascensor_schindler: "Ascensor Schindler",
}

export default function RepairHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const equipmentType = params.equipmentType as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel
  const equipmentName = EQUIPMENT_NAMES[equipmentType] || "Equipo"

  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split("T")[0])
  const [technicianName, setTechnicianName] = useState("")
  const [workDescription, setWorkDescription] = useState("")
  const [partsReplaced, setPartsReplaced] = useState<{ part_name: string; quantity: string; reference: string }[]>([])
  const [cost, setCost] = useState("")
  const [hotelPersonPresent, setHotelPersonPresent] = useState("")
  const [observations, setObservations] = useState("")

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/repair-history?hotel=${hotel}&equipmentType=${equipmentType}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setRecords(data.records || [])
      setError(null)
    } catch (error) {
      console.error("Error fetching repair records:", error)
      setError("No se pudieron cargar los registros. La tabla puede no existir aún.")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [hotel, equipmentType])

  const handleSubmit = async () => {
    if (!technicianName.trim()) {
      alert("Por favor ingresa el nombre del técnico")
      return
    }

    try {
      const response = await fetch("/api/repair-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel,
          equipmentType,
          repairDate,
          technicianName: technicianName.trim(),
          workDescription: workDescription.trim() || null,
          partsReplaced: partsReplaced.filter((p) => p.part_name || p.quantity || p.reference),
          cost: cost ? parseFloat(cost) : null,
          hotelPersonPresent: hotelPersonPresent.trim() || null,
          observations: observations.trim() || null,
        }),
      })

      if (!response.ok) throw new Error("Error al registrar reparación")

      alert(`Reparación de ${equipmentName} registrada exitosamente`)
      setDialogOpen(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      console.error("Error:", error)
      alert("Error al registrar la reparación")
    }
  }

  const resetForm = () => {
    setRepairDate(new Date().toISOString().split("T")[0])
    setTechnicianName("")
    setWorkDescription("")
    setPartsReplaced([])
    setCost("")
    setHotelPersonPresent("")
    setObservations("")
  }

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
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-6 w-6 text-orange-600" />
                Historial de Reparaciones: {equipmentName}
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Reparación
          </Button>
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
                Por favor, ejecuta el script SQL para crear la tabla repair_history
              </p>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No hay registros de reparaciones de {equipmentName} aún</p>
              <Button onClick={() => setDialogOpen(true)} className="mt-4">
                Registrar primera reparación
              </Button>
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
                        <Calendar className="h-5 w-5 text-orange-600" />
                        {new Date(record.repair_date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Registrado el {new Date(record.created_at).toLocaleDateString("es-ES")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Reparación
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.work_description && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1">Descripción del trabajo:</h3>
                      <p className="text-sm text-slate-600">{record.work_description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Técnico:
                      </h3>
                      <p className="text-sm text-slate-600">{record.technician_name}</p>
                    </div>

                    {record.hotel_person_present && (
                      <div>
                        <h3 className="font-semibold text-sm text-slate-700 mb-1">Persona del hotel:</h3>
                        <p className="text-sm text-slate-600">{record.hotel_person_present}</p>
                      </div>
                    )}
                  </div>

                  {record.parts_replaced && record.parts_replaced.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Piezas reemplazadas:
                      </h3>
                      <div className="space-y-1">
                        {record.parts_replaced.map((part: any, index: number) => (
                          <div key={index} className="text-sm text-slate-600 flex gap-2">
                            <span className="font-medium">{part.part_name}</span>
                            <span>•</span>
                            <span>Cantidad: {part.quantity}</span>
                            <span>•</span>
                            <span>Ref: {part.reference}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.cost && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-1 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Coste:
                      </h3>
                      <p className="text-sm text-slate-600">{record.cost}€</p>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold">Registrar Reparación de {equipmentName}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Ingresa los detalles de la reparación o intervención realizada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="repair-date" className="font-medium text-sm text-slate-800">
                Fecha de reparación *
              </Label>
              <Input
                id="repair-date"
                type="date"
                value={repairDate}
                onChange={(e) => setRepairDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician" className="font-medium text-sm text-slate-800">
                Nombre del técnico *
              </Label>
              <select
                id="technician"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar técnico...</option>
                <option value="xavi">Xavi</option>
                <option value="john">John</option>
                <option value="julie">Julie</option>
                <option value="antonia">Antonia</option>
                <option value="xavi/john">Xavi/John</option>
                <option value="tecnico_externo">Técnico Externo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work-description" className="font-medium text-sm text-slate-800">
                Descripción del trabajo realizado
              </Label>
              <Textarea
                id="work-description"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe el trabajo o reparación realizada..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel-person" className="font-medium text-sm text-slate-800">
                Persona del hotel presente
              </Label>
              <Input
                id="hotel-person"
                value={hotelPersonPresent}
                onChange={(e) => setHotelPersonPresent(e.target.value)}
                placeholder="Nombre de la persona del hotel"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm text-slate-800">Piezas reemplazadas</Label>
              <div className="space-y-2">
                {partsReplaced.map((part, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Pieza"
                      value={part.part_name}
                      onChange={(e) => {
                        const newParts = [...partsReplaced]
                        newParts[index].part_name = e.target.value
                        setPartsReplaced(newParts)
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Cant."
                      value={part.quantity}
                      onChange={(e) => {
                        const newParts = [...partsReplaced]
                        newParts[index].quantity = e.target.value
                        setPartsReplaced(newParts)
                      }}
                      className="w-20"
                    />
                    <Input
                      placeholder="Referencia"
                      value={part.reference}
                      onChange={(e) => {
                        const newParts = [...partsReplaced]
                        newParts[index].reference = e.target.value
                        setPartsReplaced(newParts)
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPartsReplaced(partsReplaced.filter((_, i) => i !== index))
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPartsReplaced([...partsReplaced, { part_name: "", quantity: "", reference: "" }])}
                  className="w-full"
                >
                  + Añadir pieza
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="font-medium text-sm text-slate-800">
                Coste (€)
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations" className="font-medium text-sm text-slate-800">
                Observaciones
              </Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
