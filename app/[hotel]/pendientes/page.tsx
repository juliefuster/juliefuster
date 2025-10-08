"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MapPin, User, Clock, CheckCircle2, Printer } from "lucide-react"
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
              {searchTerm ? "No se encontraron resultados" : "No hay averías Pendientes"}
            </h3>
            <p className="text-slate-600">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Las averías Pendientes aparecerán aquí"}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 print:hidden">
              {filteredIssues.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-6 bg-white print:break-inside-avoid print:border print:border-slate-300 print:shadow-none"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="bg-green-100 text-green-800 border-green-200">PENDIENTE</Badge>
                        <Badge variant="outline">{issue.category}</Badge>
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
                          Tiempo: {calculateResolutionTime(issue.createdAt, issue.resolvedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Pendientes el</p>
                      <p className="font-semibold text-slate-900">
                        {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="hidden print:block">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left p-2 font-semibold">Estado</th>
                    <th className="text-left p-2 font-semibold">Título</th>
                    <th className="text-left p-2 font-semibold">Ubicación</th>
                    <th className="text-left p-2 font-semibold">Categoría</th>
                    <th className="text-left p-2 font-semibold">Reportado por</th>
                    <th className="text-left p-2 font-semibold">Fecha Creación</th>
                    <th className="text-left p-2 font-semibold">Fecha Resolución</th>
                    <th className="text-left p-2 font-semibold">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="border-b border-slate-200">
                      <td className="p-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          PENDIENTE
                        </span>
                      </td>
                      <td className="p-2 font-medium">{issue.title}</td>
                      <td className="p-2">{issue.location}</td>
                      <td className="p-2">{issue.category}</td>
                      <td className="p-2">{issue.reportedBy}</td>
                      <td className="p-2">{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">
                        {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-2">{calculateResolutionTime(issue.createdAt, issue.resolvedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
