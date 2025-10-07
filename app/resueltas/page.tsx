"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, MapPin, User, Clock, Search, Loader2, Calendar } from "lucide-react"
import Link from "next/link"

interface MaintenanceIssue {
  id: number
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  reported_by: string
  assigned_to: string | null
  created_at: string
  resolved_at: string
}

export default function Resueltas() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<MaintenanceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadIssues()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = issues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredIssues(filtered)
    } else {
      setFilteredIssues(issues)
    }
  }, [searchTerm, issues])

  const loadIssues = async () => {
    try {
      const response = await fetch("/api/maintenance/resolved")
      const data = await response.json()
      setIssues(data)
      setFilteredIssues(data)
    } catch (error) {
      console.error("Error loading resolved issues:", error)
    } finally {
      setLoading(false)
    }
  }

  const getResolutionTime = (createdAt: string, resolvedAt: string) => {
    const created = new Date(createdAt)
    const resolved = new Date(resolvedAt)
    const diffMs = resolved.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? "s" : ""}`
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? "s" : ""}`
    } else {
      return "Menos de 1 hora"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Averías Resueltas</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredIssues.length} de {issues.length} averías mostradas
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por título, ubicación o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredIssues.length === 0 ? (
          <Card className="p-12 bg-white text-center">
            {searchTerm ? (
              <>
                <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No se encontraron resultados</h2>
                <p className="text-slate-600">Intenta con otros términos de búsqueda</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No hay averías resueltas</h2>
                <p className="text-slate-600">Las averías completadas aparecerán aquí</p>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{issue.title}</h3>
                      {issue.description && <p className="text-sm text-slate-600 mb-3">{issue.description}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resuelta
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                        {issue.category}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {getResolutionTime(issue.created_at, issue.resolved_at)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{issue.reported_by}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          Creada: {new Date(issue.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          Resuelta: {new Date(issue.resolved_at).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
