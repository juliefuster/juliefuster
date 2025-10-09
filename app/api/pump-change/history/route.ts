"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Wrench } from "lucide-react"

interface PumpRecord {
  id: string
  hotel: string
  mes: string
  fecha: string
  numero_bomba: number
  responsable: string
  observaciones: string | null
}

export default function PumpChangeHistory() {
  const params = useParams()
  const hotel = params.hotel as string
  const hotelName =
    hotel === "caledonian"
      ? "Hotel Caledonian"
      : hotel === "chi"
      ? "Hotel Chi"
      : "Hotel Desconocido"

  const supabase = createClient()
  const [records, setRecords] = useState<PumpRecord[]>([])
  const [loading, setLoading] = useState(true)

  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  useEffect(() => {
    fetchRecords()
  }, [hotel])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("pump_change_records")
        .select("*")
        .eq("hotel", hotel)
        .order("fecha", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error cargando historial:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header visible solo en pantalla */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-6 w-6 text-green-600" />
                Historial de Cambios de Bombas
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="bg-white hover:bg-slate-50 print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Encabezado que solo aparece al imprimir */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Historial de Cambios de Bombas
        </h1>
        <p className="text-sm text-slate-700">
          {hotelName} — {currentDate}
        </p>
      </div>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">Cargando historial...</p>
          </Card>
        ) : records.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">
              No hay registros de cambio de bombas aún.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow print:shadow-none">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Mes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Nº de Bomba
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Responsable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(r.fecha).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">
                      {r.mes || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.numero_bomba}</td>
                    <td className="px-4 py-3 text-slate-600">{r.responsable}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.observaciones || (
                        <span className="italic text-slate-400">Sin observaciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 🖨️ Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th,
          td {
            padding: 6px 8px !important;
            font-size: 10.5px !important;
            border: 1px solid #d1d5db !important;
            vertical-align: top !important;
          }

          th {
            background: #f1f5f9 !important;
            color: #111827 !important;
          }

          tr,
          td,
          th {
            page-break-inside: avoid !important;
          }

          button,
          .print\\:hidden {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
