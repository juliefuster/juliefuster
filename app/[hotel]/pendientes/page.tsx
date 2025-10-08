"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MapPin, User, AlertCircle, Printer } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Issue {
  id: number
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  reportedBy: string
  createdAt: string
}

export default function PendingIssues() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [resolutionDialog, setResolutionDialog] = useState<{
    open: boolean
    issueId: number | null
  }>({
    open: false,
    issueId: null,
  })
  const [resolutionData, setResolutionData] = useState({
    completionDate: new Date().toISOString().split("T")[0],
    responsible: "",
    repairDescription: "",
  })

  useEffect(() => {
    fetch(`/api/maintenance/pending?hotel=${hotel}`)
      .then((res) => res.json())
      .then((data) => {
        setIssues(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading issues:", err)
        setLoading(false)
      })
  }, [hotel])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setIssues(issues.filter((issue) => issue.id !== id))
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleResolveClick = (id: number) => {
    setResolutionDialog({ open: true, issueId: id })
    setResolutionData({
      completionDate: new Date().toISOString().split("T")[0],
      responsible: "",
      repairDescription: "",
    })
  }

  const handleResolveSubmit = async () => {
    if (!resolutionDialog.issueId) return

    try {
      const response = await fetch(`/api/maintenance/${resolutionDialog.issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resuelta",
          completionDate: resolutionData.completionDate,
          responsible: resolutionData.responsible,
          repairDescription: resolutionData.repairDescription,
        }),
      })

      if (response.ok) {
        setIssues(issues.filter((issue) => issue.id !== resolutionDialog.issueId))
        setResolutionDialog({ open: false, issueId: null })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200"
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm print:border-b-2 print:border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando averías...</p>
          </div>
        ) : issues.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay averías pendientes</h3>
            <p className="text-slate-600">Todas las averías han sido resueltas</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 print:hidden">
              {issues.map((issue) => (
                <Card key={issue.id} className="p-6 bg-white border-red-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority.toUpperCase()}</Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          PENDIENTE
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{issue.title}</h3>
                      <p className="text-slate-600 mb-4">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {issue.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {issue.reportedBy}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 print:hidden">
                      <Button
                        onClick={() => handleResolveClick(issue.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Marcar como resuelta
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="hidden print:block">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left p-2 font-semibold">Prioridad</th>
                    <th className="text-left p-2 font-semibold">Estado</th>
                    <th className="text-left p-2 font-semibold">Título</th>
                    <th className="text-left p-2 font-semibold">Ubicación</th>
                    <th className="text-left p-2 font-semibold">Categoría</th>
                    <th className="text-left p-2 font-semibold">Reportado por</th>
                    <th className="text-left p-2 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-b border-slate-200">
                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            issue.priority === "urgente"
                              ? "bg-red-100 text-red-800"
                              : issue.priority === "alta"
                                ? "bg-orange-100 text-orange-800"
                                : issue.priority === "media"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {issue.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">
                          PENDIENTE
                        </span>
                      </td>
                      <td className="p-2 font-medium">{issue.title}</td>
                      <td className="p-2">{issue.location}</td>
                      <td className="p-2">{issue.category}</td>
                      <td className="p-2">{issue.reportedBy}</td>
                      <td className="p-2">{new Date(issue.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <Dialog open={resolutionDialog.open} onOpenChange={(open) => setResolutionDialog({ open, issueId: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Marcar avería como resuelta</DialogTitle>
            <DialogDescription>Complete la información sobre la resolución de la avería</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completionDate">Fecha de finalización</Label>
              <Input
                id="completionDate"
                type="date"
                value={resolutionData.completionDate}
                onChange={(e) => setResolutionData({ ...resolutionData, completionDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsable</Label>
              <Input
                id="responsible"
                placeholder="Nombre del responsable"
                value={resolutionData.responsible}
                onChange={(e) => setResolutionData({ ...resolutionData, responsible: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repairDescription">¿Qué se hizo para reparar?</Label>
              <Textarea
                id="repairDescription"
                placeholder="Describa las acciones realizadas para resolver la avería"
                value={resolutionData.repairDescription}
                onChange={(e) => setResolutionData({ ...resolutionData, repairDescription: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setResolutionDialog({ open: false, issueId: null })}>
              Cancelar
            </Button>
            <Button
              onClick={handleResolveSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={!resolutionData.responsible || !resolutionData.repairDescription}
            >
              Confirmar resolución
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
  const handleConfirmResolution = async () => {
  if (!selectedIssue) return;

  const response = await fetch(`/api/maintenance/${selectedIssue.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "Resuelta",
      resolutionData: {
        resolvedAt: resolutionDate,
        responsible,
        notes: resolutionNotes,
      },
    }),
  });

  if (response.ok) {
    alert("Avería marcada como resuelta ✅");
    setShowDialog(false);
    fetchIssues(); // recarga la lista
  } else {
    alert("Error al actualizar la avería ❌");
  }
};

}
