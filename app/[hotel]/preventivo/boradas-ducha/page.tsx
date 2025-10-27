"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer, Droplets } from "lucide-react"

interface ShowerGroutRecord {
  id: string
  hotel: string
  type: string
  rooms: string | null // 🆕 Añadido
  date: string
  operator_name: string
  observations: string | null
  created_at: string
}

export default function ShowerGroutHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName =
    hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel

  const [records, setRecords] = useState<ShowerGroutRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`/api/shower-grout?hotel=${hotel}`)
        if (!response.ok) throw new Error("Error fetching records")
        const data = await response.json()
        setRecords(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [hotel])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 🔹 HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Droplets className="h-6 w-6 text-blue-600" />
                Historial de Boradas de Ducha o Pica
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* 🔹 MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Historial Completo</CardTitle>
            <CardDescription>Todos los registros de boradas de ducha o pica</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando registros...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No hay registros disponibles
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="text-left p-3 font-semibold text-slate-700">Tipo</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Habitación</th> {/* 🆕 */}
                      <th className="text-left p-3 font-semibold text-slate-700">Fecha</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Responsable</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={
                              record.type.toLowerCase() === "ducha"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-green-50 text-green-800 border-green-200"
                            }
                          >
                            {record.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-slate-700">{record.rooms || "-"}</td> {/* 🆕 */}
                        <td className="p-3 text-sm text-slate-700">
                          {new Date(record.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="p-3 text-sm text-slate-700">{record.operator_name}</td>
                        <td className="p-3 text-sm text-slate-600">
                          {record.observations || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 🔹 PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          header,
          button,
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  )
}
