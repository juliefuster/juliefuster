"use client"

import { Card } from "@/components/ui/card"
import { Building2, Wrench, Users, ClipboardList, Package } from "lucide-react"
import Link from "next/link"

export default function DepartmentSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl mb-6">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Sistema de Gestión Hotelera</h1>
          <p className="text-lg text-slate-600">Selecciona tu departamento para continuar</p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pisos */}
          <Link href="/pisos" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-purple-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Pisos</h2>
                  <p className="text-slate-600">Gestión de limpieza y habitaciones</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Mantenimiento */}
          <Link href="/mantenimiento" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Wrench className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Mantenimiento</h2>
                  <p className="text-slate-600">Sistema de averías y mantenimiento preventivo</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Recepción */}
          <Link href="/recepcion" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-green-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Recepción</h2>
                  <p className="text-slate-600">Gestión de reservas y atención al cliente</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Administración */}
          <Link href="/administracion" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-orange-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Administración</h2>
                  <p className="text-slate-600">Gestión de inventario y stock</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
