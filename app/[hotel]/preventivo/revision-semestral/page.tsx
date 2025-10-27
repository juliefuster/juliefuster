"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface InspectionRecord {
  id: string
  hotel: string
  item: string
  date: string
  status: "Bien" | "Regular" | "Mal"
  operator_name: string
  observations: string | null
  created_at: string
}

export default function SemiannualReview() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel

  const [records, setRecords] = useState<InspectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editObservations, setEditObservations] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/semiannual-review?hotel=${hotel}`)
      if (!response.ok) throw new Error("Error fetching records")
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: InspectionRecord) => {
    setEditingId(record.id)
    setEditStatus(record.status)
    setEditObservations(record.observations || "")
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/semiannual-review/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          observations: editObservations.trim() || null,
        }),
      })

      if (!response.ok) throw new Error("Error updating record")

      await fetchRecords()
      setEditingId(null)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el registro")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bien":
        return "bg-green-100 text-green-800 border-green-200"
      case "Regular":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Mal":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bien":
        return <CheckCircle2 className="h-4 w-4" />
      case "Regular":
        return <AlertTriangle className="h-4 w-4" />
      case "Mal":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
                Revisión Semestral - Boradas y Picas
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Elementos Revisados</CardTitle>
            <CardDescription>Haz clic en una fila para editar el estado y observaciones</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando registros...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No hay registros disponibles</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="text-left p-3 font-semibold text-slate-700">Elemento</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Fecha</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Estado</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Responsable</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Observaciones</th>
                      <th className="text-left p-3 font-semibold text-slate-700 print:hidden">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 ${
                          record.status === "Mal" ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="p-3 text-sm font-medium text-slate-800">{record.item}</td>
                        <td className="p-3 text-sm text-slate-700">
                          {new Date(record.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="p-3">
                          {editingId === record.id ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="Bien">Bien</option>
                              <option value="Regular">Regular</option>
                              <option value="Mal">Mal</option>
                            </select>
                          ) : (
                            <Badge variant="outline" className={getStatusColor(record.status)}>
                              {getStatusIcon(record.status)}
                              <span className="ml-1">{record.status}</span>
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-slate-700">{record.operator_name}</td>
                        <td className="p-3">
                          {editingId === record.id ? (
                            <Textarea
                              value={editObservations}
                              onChange={(e) => setEditObservations(e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                          ) : (
                            <span className="text-sm text-slate-600">{record.observations || "-"}</span>
                          )}
                        </td>
                        <td className="p-3 print:hidden">
                          {editingId === record.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSave(record.id)}>
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                              Editar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          header,
          button,
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }
          .bg-red-50 {
            background-color: #fef2f2 !important;
          }
        }
      `}</style>
    </div>
  )
}
