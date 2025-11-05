"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Wrench, Save } from "lucide-react"

interface Room {
  id: string
  hotel: string
  room_number: string
  floor: number
  is_common_area: boolean
}

interface InspectionItem {
  section: string
  element: string
  status: "correcto" | "pendiente" | "reparado"
  notes: string
}

const ROOM_SECTIONS = {
  Dormitorio: [
    "Nº de Hab.",
    "Escritorio",
    "Mesitas de noche",
    "Apliques",
    "Enchufes",
    "Aire acondicionado/termostato",
    "Cama",
    "Armario",
    "Sillas",
    "Papelera",
    "Posa Maleta",
    "Minibar",
    "Teléfono",
    "Televisor",
    "Caja fuerte",
    "Luces techo",
    "Luces pared",
    "Suelo",
    "Paredes",
    "Techo",
    "Zocalo",
    "Ventanas / cortinas",
  ],
  Baño: [
    "Pica",
    "WC",
    "Boton descarga",
    "Jabonera", // Added missing comma
    "Ducha / Bañera",
    "Borada",
    "Marco puerta ducha",
    "Grifería",
    "Extractor",
    "Secador",
    "Luces baño",
    "Suelo baño",
    "Techo baño",
    "Paredes baño",
    "Puerta baño",
    "ventana",
    "Toallero",
    "Colgadores",
    "Porta rollo papel higienico",
  ],
  "Terraza/Balcón": [
    "Barandilla",
    "Cristal separadaor /divisorio",
    "Pavimento",
    "Desagüe",
    "Mobiliario",
    "Luces",
    "Grifo",
    "Suelo",
    "Pared",
    "puerta terraza",
  ],
}

export function RoomInspectionModal({
  room,
  hotel,
  onClose,
}: {
  room: Room
  hotel: string
  onClose: () => void
}) {
  const supabase = createClient()

  const [inspections, setInspections] = useState<Record<string, InspectionItem>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState("")

  // ✅ Detectar si es una zona común o una habitación
  const isCommonArea = room?.is_common_area === true || !/^\d+$/.test(String(room?.room_number ?? ""))

  useEffect(() => {
    if (!isCommonArea) {
      fetchInspections()
    }
  }, [room.id])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("room_inspections")
        .select("*")
        .eq("hotel", hotel)
        .eq("room_number", room.room_number)

      if (error) throw error

      const inspectionMap: Record<string, InspectionItem> = {}
      data?.forEach((item) => {
        const key = `${item.section}-${item.element}`
        inspectionMap[key] = {
          section: item.section,
          element: item.element,
          status: item.status,
          notes: item.notes || "",
        }
      })

      setInspections(inspectionMap)
    } catch (error) {
      console.error("Error fetching inspections:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (section: string, element: string, status: InspectionItem["status"]) => {
    const key = `${section}-${element}`
    setInspections((prev) => ({
      ...prev,
      [key]: {
        section,
        element,
        status,
        notes: prev[key]?.notes || "",
      },
    }))
  }

  const handleNotesChange = (section: string, element: string, notes: string) => {
    const key = `${section}-${element}`
    setInspections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        section,
        element,
        status: prev[key]?.status || "pendiente",
        notes,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Si es zona común, guardamos solo una nota
      if (isCommonArea) {
        const { error } = await supabase.from("room_inspections").insert([
          {
            hotel,
            room_number: room.room_number,
            status: "pendiente",
            notes,
            inspected_at: new Date().toISOString(),
          },
        ])
        if (error) throw error
        onClose()
        return
      }

      // Si es habitación numerada, guardar inspección completa
      await supabase.from("room_inspections").delete().eq("hotel", hotel).eq("room_number", room.room_number)

      const inspectionRecords = Object.values(inspections).map((item) => ({
        hotel,
        room_number: room.room_number,
        section: item.section,
        element: item.element,
        status: item.status,
        notes: item.notes,
        inspected_at: new Date().toISOString(),
        inspected_by: "Usuario", // TODO: reemplazar por auth.user más adelante
      }))

      const { error } = await supabase.from("room_inspections").insert(inspectionRecords)
      if (error) throw error
      onClose()
    } catch (error) {
      console.error("Error saving inspections:", error)
      alert("Error al guardar la inspección.")
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: InspectionItem["status"]) => {
    switch (status) {
      case "correcto":
        return "bg-green-500 hover:bg-green-600"
      case "pendiente":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "reparado":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-slate-300 hover:bg-slate-400"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isCommonArea ? `Zona común — ${room.room_number}` : `Habitación ${room.room_number}`}
          </DialogTitle>
        </DialogHeader>

        {/* 🟡 Si es zona común → solo campo de notas */}
        {isCommonArea ? (
          <div className="space-y-4 py-4">
            <label className="block text-sm font-medium text-slate-700">Nota de revisión</label>
            <Textarea
              placeholder="Escribe observaciones, incidencias o acciones realizadas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[160px]"
            />
          </div>
        ) : loading ? (
          <div className="py-8 text-center text-slate-600">Cargando inspección...</div>
        ) : (
          /* 🏨 Si es habitación numerada → pestañas completas */
          <Tabs defaultValue="Dormitorio" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Dormitorio">Dormitorio</TabsTrigger>
              <TabsTrigger value="Baño">Baño</TabsTrigger>
              <TabsTrigger value="Terraza/Balcón">Terraza/Balcón</TabsTrigger>
            </TabsList>

            {Object.entries(ROOM_SECTIONS).map(([section, elements]) => (
              <TabsContent key={section} value={section} className="space-y-4">
                {elements.map((element) => {
                  const key = `${section}-${element}`
                  const inspection = inspections[key]
                  const status = inspection?.status || "pendiente"

                  return (
                    <div key={element} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">{element}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={status === "correcto" ? "default" : "outline"}
                            className={status === "correcto" ? getStatusColor("correcto") : ""}
                            onClick={() => handleStatusChange(section, element, "correcto")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Correcto
                          </Button>

                          <Button
                            size="sm"
                            variant={status === "pendiente" ? "default" : "outline"}
                            className={status === "pendiente" ? getStatusColor("pendiente") : ""}
                            onClick={() => handleStatusChange(section, element, "pendiente")}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Pendiente
                          </Button>

                          <Button
                            size="sm"
                            variant={status === "reparado" ? "default" : "outline"}
                            className={status === "reparado" ? getStatusColor("reparado") : ""}
                            onClick={() => handleStatusChange(section, element, "reparado")}
                          >
                            <Wrench className="h-4 w-4 mr-1" />
                            Reparado
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        placeholder="Comentarios adicionales..."
                        value={inspection?.notes || ""}
                        onChange={(e) => handleNotesChange(section, element, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Inspección"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
