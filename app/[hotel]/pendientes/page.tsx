"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function CompletarAveriaPage() {
  const [operator, setOperator] = useState("")
  const [notes, setNotes] = useState("")
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const hotel = params.hotel as string
  const taskId = params.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!operator.trim()) {
      toast.error("El nombre del operario es obligatorio")
      return
    }
    if (!beforePhoto || !afterPhoto) {
      toast.error("Debes adjuntar fotos del antes y después")
      return
    }

    setLoading(true)

    try {
      const timestamp = Date.now()
      const folder = `maintenance/${hotel}/${taskId}`

      // Subir fotos al storage
      const { error: beforeErr } = await supabase.storage
        .from("maintenance-photos")
        .upload(`${folder}/before_${timestamp}.jpg`, beforePhoto)
      if (beforeErr) throw beforeErr

      const { error: afterErr } = await supabase.storage
        .from("maintenance-photos")
        .upload(`${folder}/after_${timestamp}.jpg`, afterPhoto)
      if (afterErr) throw afterErr

      // Obtener URLs públicas
      const { data: beforeUrl } = supabase.storage
        .from("maintenance-photos")
        .getPublicUrl(`${folder}/before_${timestamp}.jpg`)
      const { data: afterUrl } = supabase.storage
        .from("maintenance-photos")
        .getPublicUrl(`${folder}/after_${timestamp}.jpg`)

      // Actualizar avería
      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          status: "resuelta",
          resolved_at: new Date().toISOString(),
          resolution_responsible: operator,
          resolution_notes: notes,
          before_photo_url: beforeUrl.publicUrl,
          after_photo_url: afterUrl.publicUrl,
        })
        .eq("id", taskId)

      if (error) throw error

      toast.success("Avería completada correctamente ✅")
      router.push(`/${hotel}/resueltas`)
    } catch (error: any) {
      console.error(error)
      toast.error("Error al completar la avería: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold">Completar Avería #{taskId}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Operario *</label>
            <Input
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Nombre del responsable"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción / Observaciones *</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe qué se hizo..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Foto ANTES *</label>
            <Input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Foto DESPUÉS *</label>
            <Input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Marcar como Resuelta"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
