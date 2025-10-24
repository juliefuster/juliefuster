"use client"

import { Card } from "@/components/ui/card"
import { Plus, Clock, CheckCircle2, Wrench, Calendar, Building2, TrendingUp, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Stats {
  total: number
  pending: number
  resolved: number
}

interface AnalyticsData {
  kpis: {
    totalTasksMonth: number
    avgDaysBetweenTasks: number
    onTimePercent: number
    topOperator: { name: string; count: number } | null
  }
  tasksPerDay: Record<string, number>
  tasksByOperator: { name: string; count: number }[]
  avgIntervalByType: { type: string; days: number }[]
  detailData: {
    type: string
    lastDate: string | null
    avgInterval: number
    totalMonth: number
    onTimePercent: number
  }[]
}

export default function HotelDashboard() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi"
  const hotelColor = hotel === "caledonian" ? "blue" : "purple"

  const supabase = createClient()

  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    resolved: 0,
  })

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [hotel])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from("maintenance_tasks").select("status").eq("hotel", hotel)

      if (error) throw error

      const total = data.length
      const pending = data.filter((task) => task.status?.toLowerCase().includes("pendiente")).length
      const resolved = data.filter((task) => task.status?.toLowerCase().includes("resuelta")).length

      setStats({ total, pending, resolved })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      setStats({ total: 0, pending: 0, resolved: 0 })
    }
  }

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const response = await fetch(`/api/analytics?hotel=${hotel}`)
      if (!response.ok) throw new Error("Error fetching analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // Prepare chart data
  const tasksPerDayChart = analytics
    ? Object.entries(analytics.tasksPerDay)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
          tareas: count,
        }))
        .slice(-30)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${hotelColor}-600 rounded-lg`}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{hotelName}</h1>
                <p className="text-sm text-slate-600">Sistema de Mantenimiento</p>
              </div>
            </div>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Cambiar hotel
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="dashboard" className="gap-2">
              <Wrench className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" onClick={() => !analytics && fetchAnalytics()}>
              <BarChart3 className="h-4 w-4" />
              Análisis de Rendimiento
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Pendientes</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Resueltas</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Tarjetas de acciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Link href={`/${hotel}/nueva-averia`} className="group">
                <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-blue-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-full group-hover:scale-110 transition-transform">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Nueva Avería</h2>
                      <p className="text-sm text-slate-600">Registrar un nuevo problema</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href={`/${hotel}/pendientes`} className="group">
                <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-red-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-red-600 rounded-full group-hover:scale-110 transition-transform">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Averías Pendientes</h2>
                      <p className="text-sm text-slate-600">Ver averías sin resolver</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href={`/${hotel}/resueltas`} className="group">
                <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-green-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-green-600 rounded-full group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Averías Resueltas</h2>
                      <p className="text-sm text-slate-600">Historial de problemas</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href={`/${hotel}/preventivo`} className="group">
                <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-amber-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-amber-600 rounded-full group-hover:scale-110 transition-transform">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Mantenimiento Preventivo</h2>
                      <p className="text-sm text-slate-600">Tareas programadas</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href={`/${hotel}/revisiones`} className="group">
                <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-purple-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-purple-600 rounded-full group-hover:scale-110 transition-transform">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Revisión de Habitaciones</h2>
                      <p className="text-sm text-slate-600">Inspeccionar habitaciones</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando análisis...</p>
                </div>
              </div>
            ) : analytics ? (
              <>
                {/* KPI Cards */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Análisis de Rendimiento</h2>
                  <Button onClick={fetchAnalytics} variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Tareas este mes</p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.kpis.totalTasksMonth}</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Promedio días entre tareas</p>
                        <p className="text-3xl font-bold text-green-900 mt-1">{analytics.kpis.avgDaysBetweenTasks}</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-700">Completadas a tiempo</p>
                        <p className="text-3xl font-bold text-amber-900 mt-1">{analytics.kpis.onTimePercent}%</p>
                      </div>
                      <div className="p-3 bg-amber-200 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-amber-700" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Operario destacado</p>
                        <p className="text-lg font-bold text-purple-900 mt-1 truncate">
                          {analytics.kpis.topOperator?.name || "N/A"}
                        </p>
                        <p className="text-sm text-purple-600">{analytics.kpis.topOperator?.count || 0} tareas</p>
                      </div>
                      <div className="p-3 bg-purple-200 rounded-lg">
                        <Wrench className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasks per day chart */}
                  <Card className="p-6 bg-white">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Tareas completadas por día (últimos 30 días)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tasksPerDayChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        />
                        <Bar dataKey="tareas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Average interval by type */}
                  <Card className="p-6 bg-white">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Promedio de días entre tareas por tipo
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.avgIntervalByType} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis dataKey="type" type="category" stroke="#64748b" fontSize={12} width={150} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        />
                        <Bar dataKey="days" fill="#10b981" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Tasks by operator */}
                  <Card className="p-6 bg-white lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Tareas completadas por operario</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.tasksByOperator}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Detail Table */}
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalle por tipo de tarea</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo de tarea</TableHead>
                          <TableHead>Última fecha</TableHead>
                          <TableHead>Promedio intervalo (días)</TableHead>
                          <TableHead>Total mes</TableHead>
                          <TableHead>% A tiempo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.detailData.map((row) => (
                          <TableRow key={row.type}>
                            <TableCell className="font-medium">{row.type}</TableCell>
                            <TableCell>
                              {row.lastDate
                                ? new Date(row.lastDate).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </TableCell>
                            <TableCell>{row.avgInterval} días</TableCell>
                            <TableCell>{row.totalMonth}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  row.onTimePercent >= 80
                                    ? "default"
                                    : row.onTimePercent >= 60
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {row.onTimePercent}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No hay datos de análisis disponibles</p>
                <Button onClick={fetchAnalytics}>Cargar análisis</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
