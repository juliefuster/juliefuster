"use client"

import { Card } from "@/components/ui/card"
import { Package, ArrowLeft, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdministracionMenu() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al menú principal
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-orange-600 rounded-2xl mb-6">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Administración</h1>
          <p className="text-lg text-slate-600">Gestión de inventario y recursos</p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/administracion/stock" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-orange-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Stock</h2>
                  <p className="text-slate-600">Control de inventario y pedidos</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/administracion/contactos" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-orange-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Contactos</h2>
                  <p className="text-slate-600">Base de datos de contactos y proveedores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/administracion/guia-virtual" className="group">
            <Card className="p-10 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-purple-600 cursor-pointer transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Guía Virtual</h2>
                  <p className="text-slate-600">Procedimientos y documentación interna</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
