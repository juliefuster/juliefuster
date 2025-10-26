"use client"
import { Button } from "@/components/ui/button"
import { Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PisosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al menú principal
          </Button>
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-purple-600 rounded-2xl mb-6">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Departamento de Pisos</h1>
          <p className="text-lg text-slate-600 mb-8">Próximamente disponible</p>
        </div>
      </div>
    </div>
  )
}
