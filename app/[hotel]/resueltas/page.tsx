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
    <div className="min-h-screen bg-slate-50 text-[13px]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${hotel}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Averías Resueltas</h1>
              <p className="text-xs text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="bg-transparent text-xs">
            <Printer className="h-3 w-3 mr-1" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Encabezado impresión */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Averías Resueltas</h1>
        <p className="text-xs text-slate-700">
          {hotelName} — {currentDate}
        </p>
      </div>

      {/* Search Bar */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4">
        <div className="mb-4 print:hidden">
          <Input
            placeholder="🔍 Buscar por título, ubicación o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs max-w-2xl mx-auto h-8"
          />
        </div>

        {loading ? (
          <p className="text-center text-slate-500 text-sm">Cargando averías resueltas...</p>
        ) : filteredIssues.length === 0 ? (
          <Card className="p-6 text-center text-sm">
            <p className="text-slate-600">No hay averías resueltas registradas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow print:shadow-none">
            <table className="w-full border-collapse text-[11.5px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Estado</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Título</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Descripción</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Ubicación</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Reportado</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Resuelto por</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Reparación</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Creación</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Resolución</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Tiempo</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-700 uppercase">Materiales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5">
                      <Badge className="bg-green-100 text-green-700 text-[10px]">RESUELTA</Badge>
                    </td>
                    <td className="px-2 py-1.5 text-[11px] font-medium text-slate-900">{issue.title}</td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-700 whitespace-normal">
                      {issue.description || <span className="italic text-slate-400">Sin descripción</span>}
                    </td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">{issue.location}</td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">{issue.reported_by}</td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">{issue.resolution_responsible || "—"}</td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-700 whitespace-normal">
                      {issue.resolution_notes || <span className="italic text-slate-400">Sin notas</span>}
                    </td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">
                      {new Date(issue.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">
                      {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">
                      {issue.created_at && issue.resolved_at
                        ? getTimeDifference(issue.created_at, issue.resolved_at)
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-[10.5px] text-slate-600">
                      {issue.materials_used ? (
                        <ul className="list-disc list-inside text-[10.5px] text-slate-700">
                          {JSON.parse(issue.materials_used).map((m: any, i: number) => (
                            <li key={i}>
                              {m.name} <span className="text-slate-500">({m.quantity} ud.)</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-slate-400">Sin materiales</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Estilos impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            font-size: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            padding: 4px 6px !important;
            font-size: 9.5px !important;
            border: 1px solid #d1d5db !important;
            vertical-align: top !important;
          }
          th {
            background: #f1f5f9 !important;
            color: #111827 !important;
          }
          button,
          input {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
