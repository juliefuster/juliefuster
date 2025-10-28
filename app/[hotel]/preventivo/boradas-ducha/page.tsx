"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer, Droplets } from "lucide-react"

interface ShowerGroutRecord {
  id: string
  hotel: string
  type: string
  rooms: string | null
  date: string
  operator_name: string
  observations: string | null
  created_at: string
}

export default function ShowerGroutHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : hotel === "chi" ? "Hotel Chi" : hotel

  const [records, setRecords] = useState<ShowerGroutRecord[]>([])
  const [filtered, setFiltered] = useState<ShowerGroutRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`/api/shower-grout?hotel=${hotel}`)
        if (!response.ok) throw new Error("Error fetching records")
        const data = await response.json()
        setRecords(data)
        setFiltered(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [hotel])

  const handlePrint = () => window.print()

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      records.filter(
        (r) =>
          r.rooms?.toLowerCase().includes(q) ||
          r.operator_name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      )
    )
  }, [search, records])

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
              <h1 className="text-2xl font-bold text-slate-900">Historial Boradas</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>

          {/* Botón imprimir */}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* 🔹 MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>Historial Completo</CardTitle>
              <CardDescription>Registros de boradas de ducha o pica</CardDescription>
            </div>

            {/* 🔍 Buscador */}
            <Input
              className="max-w-xs print:hidden"
              placeholder="Buscar por habitación, tipo o responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-slate-500">Cargando registros...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No hay registros</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="px-2 py-1 text-left">Tipo</th>
                      <th className="px-2 py-1 text-left">Habitaciones</th>
                      <th className="px-2 py-1 text-left">Fecha</th>
                      <th className="px-2 py-1 text-left">Responsable</th>
                      <th className="px-2 py-1 text-left">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr key={record.id} className="border-b text-xs hover:bg-slate-50">
                        <td className="px-2 py-1">
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
                        <td className="px-2 py-1">{record.rooms || "-"}</td>
                        <td className="px-2 py-1">
                          {new Date(record.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-2 py-1">{record.operator_name}</td>
                        <td className="px-2 py-1">{record.observations || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ✅ Estilos de impresión optimizados */}
     <style jsx global>{`
  @media print {
    @page {
      size: A4 landscape;
      margin: 0.7cm;
    }

    /* Mostrar encabezado personalizado */
    body::before {
      content: "🏨 ${hotelName} — 📅 Impreso el ${new Date().toLocaleDateString("es-ES")}";
      display: block;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px;
      margin-bottom: 6px;
      width: 100%;
    }

    header,
    button,
    input,
    .print\\:hidden {
      display: none !important;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px !important;
    }

    th,
    td {
      border: 1px solid #000 !important;
      padding: 2px !important;
      height: 10px !important;
      line-height: 1.1 !important;
    }

    tr {
      page-break-inside: avoid;
      height: 10px !important;
    }
  }
`}</style>

    </div>
  )
}
