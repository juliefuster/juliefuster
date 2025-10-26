"use client"

import { Card } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function HotelSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl mb-6">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Sistema de Mantenimiento</h1>
          <p className="text-lg text-slate-600">Selecciona tu hotel para continuar</p>
        </div>

        {/* Hotel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/caledonian" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Hotel Caledonian</h2>
                  <p className="text-slate-600">Acceder al sistema de mantenimiento</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/chi" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-yellow-500 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-yellow-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Hotel Chi</h2>
                  <p className="text-slate-600">Acceder al sistema de mantenimiento</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
