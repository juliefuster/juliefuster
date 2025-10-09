"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Printer, AlertCircle, CheckCircle } from "lucide-react"

interface Issue {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  reported_by: string
  created_at: string
}

export default function PendingIssues() {
  const params = useParams()
  const router = useRouter()
  const hotel = params.hotel as string
  const hotelName =
    hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : "Hotel Desconocido"

  const supabase = createClient()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null)
  const [resolveForm, setResolveForm] = useState({
    resolvedAt: new Date().toISOString().split("T")[0],
    responsible: "",
    notes: "",
  })

  useEffect(() => {
    fetchIssues()
  }, [hotel])

  // 🔹 Cargar averías pendientes desde Supabase
  const fetchIssues = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .eq("hotel", hotel)
        .ilike("status", "%pendiente%")
        .order("created_at", { ascending: false })

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error("Error cargando averías pendientes:", error)
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = (issue: Issue) => {
    setResolvingIssue(issue)
    setResolveForm({
      resolvedAt: new Date().toISOString().split("T")[0],
      responsible: "",
      notes: "",
    })
  }

  // ✅ Actualiza y mueve la avería a la página de resueltas
  const handleSaveResolve = async () => {
    if (!resolvingIssue) return

    if (!resolveForm.resolvedAt || !resolveForm.responsible || !resolveForm.notes) {
      alert("Por favor completa todos los campos antes de marcar como resuelta.")
      return
    }

    try {
      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          status: "resuelta", // 👈 minúsculas para coincidir con la página de resueltas
          resolved_at: resolveForm.resolvedAt,
          resolution_responsible: resolveForm.responsible,
          resolution_notes: resolveForm.notes,
        })
        .eq("id", resolvingIssue.id)

      if (error) throw error

      // 🔹 Recargar la lista para eliminarla de pendientes
      await fetchIssues()
      setResolvingIssue(null)

      // 🔹 Redirigir automáticamente a la página de resueltas
      router.push(`/${hotel}/resueltas`)
    } catch (error) {
      console.error("Error al marcar como resuelta:", error)
      alert("Error al guardar la resolución de la avería.")
    }
  }

  const handlePrint = () => window.print()

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgente":
        return "bg-red-100 text-red-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:border-b-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}`} className="print:hidden">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Averías Pendientes</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-600">Cargando averías...</div>
        ) : issues.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay averías pendientes</h3>
            <p className="text-slate-600">Todas las averías han sido resueltas 🎉</p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reportado por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase print:hidden">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge className="bg-red-100 text-red-800">PENDIENTE</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority?.toUpperCase() || "BAJA"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{issue.title || "Sin título"}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.location || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.category || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.reported_by || "Desconocido"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(issue.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 print:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolve(issue)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 🧾 Modal para completar avería */}
      <Dialog open={!!resolvingIssue} onOpenChange={() => setResolvingIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Completar Avería</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-1">{resolvingIssue?.title}</h3>
              <p className="text-sm text-slate-600">{resolvingIssue?.description}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resolvedAt">📅 Fecha de finalización *</Label>
              <Input
                id="resolvedAt"
                type="date"
                value={resolveForm.resolvedAt}
                onChange={(e) => setResolveForm({ ...resolveForm, resolvedAt: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="responsible">👷 Responsable *</Label>
              <Input
                id="responsible"
                placeholder="Nombre del técnico o responsable"
                value={resolveForm.responsible}
                onChange={(e) => setResolveForm({ ...resolveForm, responsible: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">🛠️ Qué se hizo para reparar *</Label>
              <Textarea
                id="notes"
                placeholder="Describe brevemente qué se hizo para solucionar la avería..."
                value={resolveForm.notes}
                onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolvingIssue(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveResolve} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Guardar y Marcar como Resuelta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
