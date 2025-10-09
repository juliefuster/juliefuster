"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Wrench, User } from "lucide-react"

export default function CambioBombas() {
  const params = useParams()
  const hotel = params.hotel as string
  const supabase = createClient()

  const [selectedPump, setSelectedPump] = useState<number | null>(null)
  const [operatorName, setOperatorName] = useState("")
  const [observations, setObservations] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!selectedPump || !operatorName) {
      alert("Selecciona la bomba y el operario antes de guardar.")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.from("pump_change_records").insert([
        {
          hotel,
          pump_number: selectedPump,
          operator_name: operatorName,
          observations: observations || null,
          date: new Date().toISOString().split("T")[0],
        },
      ])

      if (error) throw error
      alert("✅ Cambio de bomba registrado correctamente.")
      setOpen(false)
      setSelectedPump(null)
      setOperatorName("")
      setObservations("")
    } catch (err) {
      console.error(err)
      alert("❌ Error al registrar el cambio.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-500" />
            Cambio de Bombas
          </CardTitle>
          <CardDescription>Registra el cambio de bomba semanal</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button
                variant={selectedPump === 1 ? "default" : "outline"}
                onClick={() => setSelectedPump(1)}
                className="flex-1"
              >
                Bomba 1
              </Button>
              <Button
                variant={selectedPump === 2 ? "default" : "outline"}
                onClick={() => setSelectedPump(2)}
                className="flex-1"
              >
                Bomba 2
              </Button>
            </div>

            {/* 🔽 Selector de operario */}
            <div>
              <Label htmlFor="operator" className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Nombre del Operario *
              </Label>
              <select
                id="operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full mt-1 border rounded-md px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Selecciona un operario</option>
                <option value="Xavi">Xavi</option>
                <option value="John">John</option>
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                placeholder="Escribe observaciones opcionales..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
