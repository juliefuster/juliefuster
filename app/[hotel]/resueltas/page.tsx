"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CheckCircle2, Printer } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Issue {
  id: number
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  reportedBy: string
  resolvedBy: string
  createdAt: string
  resolvedAt: string | null
}

export default function ResolvedIssues() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"

  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/maintenance/resolved?hotel=${hotel}`)
      .then((res) => res.json())
      .then((data) => {
        setIssues(data)
        setFilteredIssues(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading issues:", err)
        setLoading(false)
      })
  }, [hotel])

  useEffect(() => {
    const filtered = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredIssues(filtered)
  }, [searchTerm, issues])

  const calculateResolutionTime = (createdAt: string, resolvedAt: string | null) => {
    if (!resolvedAt) return "N/A"
    const created = new Date(createdAt)
    const resolved = new Date(resolvedAt)
    const diffHours = Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60))
    if (diffHours < 24) return `${diffHours}h`
    return `${Math.round(diffHours / 24)}d`
  }

  const handlePrint = () => {
    window.print()
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
                <h1 className="text-2xl font-bold text-slate-900">Averías Resueltas</h1>
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
        <div className="mb-6 print:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por título, ubicación o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando averías...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <CheckCircle2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? "No se encontraron resultados" : "No hay averías resueltas"}
            </h3>
            <p className="text-slate-600">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Las averías resueltas aparecerán aquí"}
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reportado por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Resuelto por</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha Creación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Fecha Resolución
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge className="bg-green-100 text-green-800">RESUELTA</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{issue.title}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.location}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.category}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.reportedBy}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.resolvedBy || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(issue.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString("es-ES") : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {calculateResolutionTime(issue.createdAt, issue.resolvedAt)}
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
