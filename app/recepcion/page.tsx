"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"

export default function RecepcionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al menú principal
          </Button>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-green-600 rounded-2xl mb-6">
            <ClipboardList className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Departamento de Recepción</h1>
          <p className="text-lg text-slate-600">Selecciona el hotel para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hotel Chi - Yellow */}
          <Link href="/recepcion/chi" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-yellow-500 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-yellow-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Hotel Chi</h2>
                  <p className="text-slate-600">Gestión de parking y recepción</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Hotel Caledonian - Blue */}
          <Link href="/recepcion/caledonian" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Hotel Caledonian</h2>
                  <p className="text-slate-600">Gestión de parking y recepción</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
