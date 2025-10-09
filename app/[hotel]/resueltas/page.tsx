"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

interface ResolvedIssue {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: string
  reported_by: string
  resolution_responsible: string
  resolution_notes: string | null
  created_at: string
  resolved_at: string
  materials_used: string | null
}

export default function ResolvedIssuesPage() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : "Hotel Desconocido"

  const supabase = createClient()
  const [issues, setIssues] = useState<ResolvedIssue[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResolvedIssues()
  }, [hotel])

  const fetchResolvedIssues = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .eq("hotel", hotel)
        .ilike("status", "%resuelta%")
        .order("resolved_at", { ascending: false })

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error("Error cargando averías resueltas:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = issues.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const handlePrint = () => window.print()

  const getTimeDifference = (created: string, resolved: string) => {
    const start = new Date(created).getTime()
    const end = new Date(resolved).getTime()
    const hours = Math.round((end - start) / (1000 * 60 * 60))
    return `${hours}h`
  }

  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header (visible solo en pantalla) */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Averías Resueltas</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Encabezado de impresión (solo visible al imprimir) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Averías Resueltas</h1>
        <p className="text-sm text-slate-700">
          {hotelName} — {currentDate}
        </p>
      </div>

      {/* Search Bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 print:hidden">
          <Input
            placeholder="🔍 Buscar por título, ubicación o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-3xl mx-auto"
          />
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Cargando averías resueltas...</p>
        ) : filteredIssues.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No hay averías resueltas registradas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow print:shadow-none">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reportado por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Resuelto por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Reparación Realizada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha creación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Fecha resolución
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tiempo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Materiales / Repuestos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge className="bg-green-100 text-green-700">RESUELTA</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{issue.title}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-normal">
                      {issue.description || <span className="italic text-slate-400">Sin descripción</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{issue.location}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.reported_by}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.resolution_responsible || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 whitespace-normal">
                      {issue.resolution_notes || <span className="italic text-slate-400">Sin notas</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(issue.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {issue.created_at && issue.resolved_at
                        ? getTimeDifference(issue.created_at, issue.resolved_at)
                        : "—"}
                    </td>

                    {/* 🧱 Materiales usados */}
                    <td className="px-4 py-3 text-slate-600">
                      {issue.materials_used ? (
                        <ul className="list-disc list-inside text-sm text-slate-700">
                          {JSON.parse(issue.materials_used).map((m: any, i: number) => (
                            <li key={i}>
                              {m.name} — <span className="text-slate-500">{m.quantity} ud.</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-slate-400">Sin materiales usados</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 🖨️ Estilos para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th,
          td {
            padding: 6px 8px !important;
            font-size: 10.5px !important;
            border: 1px solid #d1d5db !important;
            vertical-align: top !important;
          }

          th {
            background: #f1f5f9 !important;
            color: #111827 !important;
          }

          table,
          tr,
          td,
          th {
            page-break-inside: avoid !important;
          }

          .shadow,
          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .print\\:hidden,
          button,
          input,
          select {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
