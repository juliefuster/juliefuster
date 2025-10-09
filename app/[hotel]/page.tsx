"use client"

import { Card } from "@/components/ui/card"
import { Plus, Clock, CheckCircle2, Wrench, Calendar, Building2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  total: number
  pending: number
  resolved: number
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

  useEffect(() => {
    fetchStats()
  }, [hotel])

  const fetchStats = async () => {
    try {
      // 🔹 Consulta todas las averías del hotel seleccionado
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("status")
        .eq("hotel", hotel)

      if (error) throw error

      // 🔹 Calcula los totales
      const total = data.length
      const pending = data.filter((task) =>
        task.status?.toLowerCase().includes("pendiente")
      ).length
      const resolved = data.filter((task) =>
        task.status?.toLowerCase().includes("resuelta")
      ).length

      setStats({ total, pending, resolved })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      setStats({ total: 0, pending: 0, resolved: 0 })
    }
  }

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
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Cambiar hotel
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats.total}
                </p>
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
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.pending}
                </p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.resolved}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjetas de acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/${hotel}/nueva-averia`} className="group">
            <Card className="p-8 bg-white hover:shadow-lg transition-all duration-200 border-2 border-slate-200 hover:border-blue-500 cursor-pointer">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-blue-600 rounded-full group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Nueva Avería
                  </h2>
                  <p className="text-sm text-slate-600">
                    Registrar un nuevo problema
                  </p>
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
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Averías Pendientes
                  </h2>
                  <p className="text-sm text-slate-600">
                    Ver averías sin resolver
                  </p>
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
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Averías Resueltas
                  </h2>
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
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Mantenimiento Preventivo
                  </h2>
                  <p className="text-sm text-slate-600">Tareas programadas</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
