"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Printer, AlertCircle, CheckCircle, Plus, Trash2, Search } from "lucide-react"

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

interface Material {
  name: string
  quantity: number
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
  const [materials, setMaterials] = useState<Material[]>([{ name: "", quantity: 1 }])
  const [searchTerm, setSearchTerm] = useState("")

  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  useEffect(() => {
    fetchIssues()
  }, [hotel])

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
    setMaterials([{ name: "", quantity: 1 }])
  }

  const addMaterial = () => setMaterials([...materials, { name: "", quantity: 1 }])
  const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index))
  const updateMaterial = (index: number, field: keyof Material, value: string | number) => {
    const updated = [...materials]
    updated[index] = { ...updated[index], [field]: value }
    setMaterials(updated)
  }

  const handleSaveResolve = async () => {
    if (!resolvingIssue) return

    if (!resolveForm.resolvedAt || !resolveForm.responsible || !resolveForm.notes) {
      alert("Por favor completa todos los campos obligatorios antes de marcar como resuelta.")
      return
    }

    try {
      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          status: "resuelta",
          resolved_at: resolveForm.resolvedAt,
          resolution_responsible: resolveForm.responsible,
          resolution_notes: resolveForm.notes,
          materials_used: JSON.stringify(materials.filter((m) => m.name.trim() !== "")),
        })
        .eq("id", resolvingIssue.id)

      if (error) throw error

      await fetchIssues()
      setResolvingIssue(null)
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

  const filteredIssues = issues.filter((issue) => {
    const term = searchTerm.toLowerCase()
    return (
      issue.title?.toLowerCase().includes(term) ||
      issue.description?.toLowerCase().includes(term) ||
      issue.location?.toLowerCase().includes(term) ||
      issue.category?.toLowerCase().includes(term) ||
      issue.reported_by?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative z-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden relative z-10">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-0">
        {/* 🔍 Search bar */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border print:hidden relative z-10">
          <Search className="h-5 w-5 text-slate-500" />
          <Input
            placeholder="Buscar por título, ubicación, categoría o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <p className="text-xs text-slate-600">
              {filteredIssues.length} resultado{filteredIssues.length !== 1 && "s"}
            </p>
          )}
        </div>

        {/* Encabezado solo para impresión */}
        <div className="hidden print:block text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Averías Pendientes — {hotelName}</h1>
          <p className="text-sm text-slate-700">Fecha de impresión: {currentDate}</p>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Cargando averías...</div>
        ) : filteredIssues.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay averías pendientes</h3>
            <p className="text-slate-600">Todas las averías han sido resueltas 🎉</p>
          </Card>
        ) : (
          <div className="relative z-0 bg-white rounded-lg shadow overflow-x-auto print:shadow-none">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Estado",
                    "Prioridad",
                    "Título",
                    "Descripción",
                    "Ubicación",
                    "Categoría",
                    "Reportado por",
                    "Fecha",
                    "Acciones",
                  ].map((header, i) => (
                    <th
                      key={i}
                      className={`px-2 py-3 text-left text-xs font-semibold text-slate-700 uppercase ${
                        header === "Acciones" ? "print:hidden" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-2 py-3 text-sm">
                      <Badge className="bg-red-100 text-red-800">PENDIENTE</Badge>
                    </td>
                    <td className="px-2 py-3 text-sm">
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority?.toUpperCase() || "BAJA"}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-sm font-medium text-slate-900">
                      {issue.title || "Sin título"}
                    </td>
                    <td className="px-2 py-3 text-slate-600 text-xs whitespace-normal">
                      {issue.description || "Sin descripción"}
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-600">{issue.location || "N/A"}</td>
                    <td className="px-2 py-3 text-sm text-slate-600">{issue.category || "N/A"}</td>
                    <td className="px-2 py-3 text-sm text-slate-600">{issue.reported_by || "Desconocido"}</td>
                    <td className="px-2 py-3 text-sm text-slate-600">
                      {new Date(issue.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-2 py-3 print:hidden min-w-[140px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolve(issue)}
                        className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50 whitespace-nowrap"
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

      {/* Modal para resolver */}
      <Dialog open={!!resolvingIssue} onOpenChange={() => setResolvingIssue(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto relative z-50">
          <DialogHeader>
            <DialogTitle>Marcar Avería como Resuelta</DialogTitle>
            <DialogDescription>
              Completa la información sobre la resolución de la avería: {resolvingIssue?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fecha de Finalización *</Label>
              <Input
                type="date"
                value={resolveForm.resolvedAt}
                onChange={(e) => setResolveForm({ ...resolveForm, resolvedAt: e.target.value })}
              />
            </div>

           <div className="space-y-2">
  <Label>Responsable *</Label>
  <select
    value={resolveForm.responsible}
    onChange={(e) => setResolveForm({ ...resolveForm, responsible: e.target.value })}
    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  >
    <option value="">Seleccionar operario...</option>
    <option value="xavi">Xavi</option>
    <option value="john">John</option>
    <option value="julie">Julie</option>
    <option value="antonia">Antonia</option>
    <option value="xavi/john">Xavi/John</option>
  </select>
</div>


            <div className="space-y-2">
              <Label>¿Qué se hizo para reparar? *</Label>
              <Textarea
                placeholder="Describe las acciones realizadas..."
                rows={4}
                value={resolveForm.notes}
                onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Materiales Utilizados (opcional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Material
                </Button>
              </div>
              {materials.map((m, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <Input
                    placeholder="Nombre del material"
                    value={m.name}
                    onChange={(e) => updateMaterial(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={m.quantity}
                    onChange={(e) => updateMaterial(i, "quantity", Number(e.target.value))}
                    className="w-24"
                  />
                  {materials.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolvingIssue(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveResolve} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Resuelta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🖨️ Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            font-size: 10pt;
          }

          header,
          .print\\:hidden,
          .no-print {
            display: none !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            font-size: 9pt !important;
          }

          th,
          td {
            border: 1px solid #ccc !important;
            padding: 6px 8px !important;
            word-wrap: break-word !important;
          }

          th {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            font-weight: 600 !important;
          }

          tr:nth-child(even) {
            background-color: #fafafa !important;
          }

          h1 {
            color: #111 !important;
          }
        }
      `}</style>
    </div>
  )
}
