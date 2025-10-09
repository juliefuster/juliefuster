"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Printer, Wrench } from "lucide-react"
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
  created_at: string
  resolved_at: string
  materials_used: string | null
}

export default function ResolvedIssuesPage() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName =
    hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : "Hotel Desconocido"

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
      i.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handlePrint = () => window.print()

  const getTimeDifference = (created: string, resolved: string) => {
    const start = new Date(created).getTime()
    const end = new Date(resolved).getTime()
    const hours = Math.round((end - start) / (1000 * 60 * 60))
    return hours > 0 ? `${hours}h` : `${hours}h`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Search Bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Input
            placeholder="🔍 Buscar por título, ubicación o categoría..."
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reportado por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Resuelto por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha creación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha resolución</th>
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
                    <td className="px-4 py-3 text-slate-600">{issue.location}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.category}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.reported_by}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.resolution_responsible || "—"}</td>
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
    </div>
  )
}
