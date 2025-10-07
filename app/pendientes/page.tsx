"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertCircle, MapPin, User, CheckCircle2, Loader2 } from "lucide-react"
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
}

export default function Pendientes() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      const response = await fetch("/api/maintenance/pending")
      const data = await response.json()
      setIssues(data)
    } catch (error) {
      console.error("Error loading issues:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        loadIssues()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "bg-red-100 text-red-700 border-red-200"
      case "alta":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "media":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "baja":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-red-100 text-red-700 border-red-200"
      case "en_progreso":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Averías Pendientes</h1>
              <p className="text-sm text-slate-600 mt-1">{issues.length} averías sin resolver</p>
            </div>
            <Link href="/nueva-averia">
              <Button className="bg-blue-600 hover:bg-blue-700">Nueva Avería</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {issues.length === 0 ? (
          <Card className="p-12 bg-white text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No hay averías pendientes</h2>
            <p className="text-slate-600">Todas las averías han sido resueltas o están en progreso</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{issue.title}</h3>
                        {issue.description && <p className="text-sm text-slate-600 mb-3">{issue.description}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(issue.status)}>
                        <Clock className="h-3 w-3 mr-1" />
                        {issue.status === "pendiente" ? "Pendiente" : "En Progreso"}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                        {issue.category}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{issue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{issue.reported_by}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(issue.created_at).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:min-w-[180px]">
                    {issue.status === "pendiente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(issue.id, "en_progreso")}
                        disabled={updatingId === issue.id}
                        className="w-full"
                      >
                        {updatingId === issue.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar Trabajo"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => updateStatus(issue.id, "resuelta")}
                      disabled={updatingId === issue.id}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {updatingId === issue.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Marcar Resuelta
                        </>
                      )}
                    </Button>
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
