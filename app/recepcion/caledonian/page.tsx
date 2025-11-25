"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Trash2, Printer, AlertCircle, Car, CheckCircle, Clock, Bell, Edit } from "lucide-react"
import Link from "next/link"

interface ParkingRecord {
  id: string
  cliente: string
  habitacion: string
  checkinCoche: string
  checkoutCoche: string
  checkinCliente: string
  checkoutCliente: string
  hechoPor: string
  cobrado: boolean
  facturaNumero: string
}

export default function ParkingCaledonianPage() {
  const [records, setRecords] = useState<ParkingRecord[]>([])
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    cliente: "",
    habitacion: "",
    checkinCoche: "",
    checkoutCoche: "",
    checkinCliente: "",
    checkoutCliente: "",
    hechoPor: "",
    facturaNumero: "",
    cobrado: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem("parking_caledonian")
    if (saved) {
      setRecords(JSON.parse(saved))
    }
  }, [])

  const saveToLocalStorage = (data: ParkingRecord[]) => {
    localStorage.setItem("parking_caledonian", JSON.stringify(data))
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.cliente ||
      !formData.habitacion ||
      !formData.checkinCoche ||
      !formData.checkinCliente ||
      !formData.checkoutCliente ||
      !formData.hechoPor
    ) {
      alert("Por favor, completa todos los campos obligatorios")
      return
    }

    if (editingId) {
      const updatedRecords = records.map((r) =>
        r.id === editingId
          ? {
              ...r,
              cliente: formData.cliente,
              habitacion: formData.habitacion,
              checkinCoche: formData.checkinCoche,
              checkoutCoche: formData.checkoutCoche,
              checkinCliente: formData.checkinCliente,
              checkoutCliente: formData.checkoutCliente,
              hechoPor: formData.hechoPor,
            }
          : r,
      )
      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
      setEditingId(null)
    } else {
      const newRecord: ParkingRecord = {
        id: Date.now().toString(),
        cliente: formData.cliente,
        habitacion: formData.habitacion,
        checkinCoche: formData.checkinCoche,
        checkoutCoche: formData.checkoutCoche,
        checkinCliente: formData.checkinCliente,
        checkoutCliente: formData.checkoutCliente,
        hechoPor: formData.hechoPor,
        cobrado: false,
        facturaNumero: "",
      }

      const updatedRecords = [...records, newRecord]
      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
    }

    setFormData({
      cliente: "",
      habitacion: "",
      checkinCoche: "",
      checkoutCoche: "",
      checkinCliente: "",
      checkoutCliente: "",
      hechoPor: "",
      facturaNumero: "",
      cobrado: false,
    })
    setShowForm(false)
  }

  const handleCobradoChange = (recordId: string) => {
    const record = records.find((r) => r.id === recordId)
    if (!record) return

    if (!record.cobrado) {
      const facturaNum = prompt("Introduce el número de factura:")
      if (!facturaNum || facturaNum.trim() === "") {
        alert("Debes introducir un número de factura para marcar como cobrado")
        return
      }

      const updatedRecords = records.map((r) =>
        r.id === recordId ? { ...r, cobrado: true, facturaNumero: facturaNum } : r,
      )
      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
    }
  }

  const handleDelete = (recordId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      const updatedRecords = records.filter((r) => r.id !== recordId)
      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
    }
  }

  const handlePrint = (record: ParkingRecord) => {
    const printWindow = window.open("", "", "width=300,height=500")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Parking</title>
          <style>
            @page { 
              size: A4;
              margin: 0;
            }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 11px;
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            .ticket-container {
              position: absolute;
              top: 5mm;
              left: 5mm;
              width: 70mm;
            }
            h2 { 
              font-size: 14px;
              text-align: center;
              margin: 0 0 5px 0;
              border-bottom: 2px solid #000;
              padding-bottom: 5px;
            }
            .row { 
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              border-bottom: 1px dashed #ccc;
              padding: 2px 0;
            }
            .label { font-weight: bold; }
            .value { text-align: right; }
            .sello { 
              margin-top: 10px;
              border: 1px solid #000;
              padding: 15px 5px;
              text-align: center;
              font-size: 9px;
            }
            .footer {
              text-align: center;
              font-size: 9px;
              margin-top: 10px;
              border-top: 2px solid #000;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <h2>HOTEL CALEDONIAN - PARKING</h2>
            <div class="row">
              <span class="label">Cliente:</span>
              <span class="value">${record.cliente}</span>
            </div>
            <div class="row">
              <span class="label">Habitación:</span>
              <span class="value">${record.habitacion}</span>
            </div>
            <div class="row">
              <span class="label">Check-in coche:</span>
              <span class="value">${new Date(record.checkinCoche).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
            </div>
            <div class="row">
              <span class="label">Check-out coche:</span>
              <span class="value">${record.checkoutCoche ? new Date(record.checkoutCoche).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "-"}</span>
            </div>
            <div class="row">
              <span class="label">Check-out cliente:</span>
              <span class="value">${new Date(record.checkoutCliente).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
            </div>
            <div class="row">
              <span class="label">Cobrado:</span>
              <span class="value">${record.cobrado ? "SÍ" : "NO"}</span>
            </div>
            <div class="row">
              <span class="label">Nº Factura:</span>
              <span class="value">${record.facturaNumero || "-"}</span>
            </div>
            <div class="sello">SELLO DEL HOTEL</div>
            <div class="footer">Gracias por su estancia</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleEdit = (record: ParkingRecord) => {
    setFormData({
      cliente: record.cliente,
      habitacion: record.habitacion,
      checkinCoche: record.checkinCoche,
      checkoutCoche: record.checkoutCoche,
      checkinCliente: record.checkinCliente,
      checkoutCliente: record.checkoutCliente,
      hechoPor: record.hechoPor,
      facturaNumero: record.facturaNumero,
      cobrado: record.cobrado,
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const isCheckoutToday = (checkoutDate: string) => {
    const today = new Date()
    const checkout = new Date(checkoutDate)
    return today.toDateString() === checkout.toDateString()
  }

  const filteredRecords = showPendingOnly ? records.filter((r) => !r.cobrado) : records

  const totalRecords = records.length
  const cobrados = records.filter((r) => r.cobrado).length
  const pendientes = records.filter((r) => !r.cobrado).length
  const checkoutTodayUnpaid = records.filter((r) => !r.cobrado && isCheckoutToday(r.checkoutCliente))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/recepcion">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Dashboard Parking - Hotel Caledonian</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión completa de parking</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? "Ver Dashboard" : "+ Nuevo Registro"}
          </Button>
        </div>

        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Parkings</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{totalRecords}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Cobrados</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{cobrados}</p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">{pendientes}</p>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!showForm && checkoutTodayUnpaid.length > 0 && (
          <Button
            onClick={() => setShowAlerts(!showAlerts)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold shadow-lg"
          >
            <Bell className="mr-2 h-6 w-6 animate-pulse" />
            AVISOS: {checkoutTodayUnpaid.length} Check-out HOY sin parking cobrado
          </Button>
        )}

        {!showForm && showAlerts && checkoutTodayUnpaid.length > 0 && (
          <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-red-800 text-xl">
                  <AlertCircle className="mr-2 h-6 w-6 animate-pulse" />
                  Check-out HOY - Parkings Pendientes de Cobro
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAlerts(false)}>
                  Cerrar
                </Button>
              </div>
              <CardDescription className="text-red-700">
                Estos clientes hacen check-out hoy y probablemente sacarán el coche sin haber pagado el parking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {checkoutTodayUnpaid.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">{record.cliente}</p>
                        <p className="text-sm text-gray-600 mt-1">Habitación {record.habitacion}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Check-out: {new Date(record.checkoutCliente).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCobradoChange(record.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Cobrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Registro de Parking" : "Añadir Nuevo Registro de Parking"}</CardTitle>
              <CardDescription>Completa todos los campos obligatorios marcados con *</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRecord} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Input
                      id="cliente"
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="habitacion">Nº Habitación *</Label>
                    <Input
                      id="habitacion"
                      value={formData.habitacion}
                      onChange={(e) => setFormData({ ...formData, habitacion: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkinCoche">Check-in coche *</Label>
                    <Input
                      id="checkinCoche"
                      type="date"
                      value={formData.checkinCoche}
                      onChange={(e) => setFormData({ ...formData, checkinCoche: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkoutCoche">Check-out coche</Label>
                    <Input
                      id="checkoutCoche"
                      type="date"
                      value={formData.checkoutCoche}
                      onChange={(e) => setFormData({ ...formData, checkoutCoche: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkinCliente">Check-in real cliente *</Label>
                    <Input
                      id="checkinCliente"
                      type="date"
                      value={formData.checkinCliente}
                      onChange={(e) => setFormData({ ...formData, checkinCliente: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkoutCliente">Check-out real cliente *</Label>
                    <Input
                      id="checkoutCliente"
                      type="date"
                      value={formData.checkoutCliente}
                      onChange={(e) => setFormData({ ...formData, checkoutCliente: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hechoPor">Hecho por *</Label>
                    <Input
                      id="hechoPor"
                      value={formData.hechoPor}
                      onChange={(e) => setFormData({ ...formData, hechoPor: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingId ? "Guardar Cambios" : "Añadir Registro"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({
                        cliente: "",
                        habitacion: "",
                        checkinCoche: "",
                        checkoutCoche: "",
                        checkinCliente: "",
                        checkoutCliente: "",
                        hechoPor: "",
                        facturaNumero: "",
                        cobrado: false,
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showPending"
                  checked={showPendingOnly}
                  onCheckedChange={(checked) => setShowPendingOnly(checked as boolean)}
                />
                <Label htmlFor="showPending" className="cursor-pointer font-medium">
                  Mostrar sólo pendientes de cobrar
                </Label>
              </div>
            </div>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Registros de Parking ({filteredRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-100 border-b-2 border-blue-200">
                        <th className="p-3 text-left font-semibold">Cliente</th>
                        <th className="p-3 text-left font-semibold">Hab.</th>
                        <th className="p-3 text-left font-semibold">Check-in coche</th>
                        <th className="p-3 text-left font-semibold">Check-out coche</th>
                        <th className="p-3 text-left font-semibold">Check-in cliente</th>
                        <th className="p-3 text-left font-semibold">Check-out cliente</th>
                        <th className="p-3 text-left font-semibold">Hecho por</th>
                        <th className="p-3 text-center font-semibold">Cobrado</th>
                        <th className="p-3 text-left font-semibold">Nº Factura</th>
                        <th className="p-3 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-gray-500">
                            No hay registros
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record) => {
                          const isYellow = !record.cobrado && isCheckoutToday(record.checkoutCliente)
                          const isGreen = record.cobrado

                          return (
                            <tr
                              key={record.id}
                              className={`border-b hover:bg-gray-50 ${
                                isGreen ? "bg-green-50" : isYellow ? "bg-yellow-100" : ""
                              }`}
                            >
                              <td className="p-3">{record.cliente}</td>
                              <td className="p-3">{record.habitacion}</td>
                              <td className="p-3">{new Date(record.checkinCoche).toLocaleDateString("es-ES")}</td>
                              <td className="p-3">
                                {record.checkoutCoche
                                  ? new Date(record.checkoutCoche).toLocaleDateString("es-ES")
                                  : "-"}
                              </td>
                              <td className="p-3">{new Date(record.checkinCliente).toLocaleDateString("es-ES")}</td>
                              <td className="p-3">{new Date(record.checkoutCliente).toLocaleDateString("es-ES")}</td>
                              <td className="p-3">{record.hechoPor}</td>
                              <td className="p-3 text-center">
                                {record.cobrado ? (
                                  <span className="text-green-700 font-semibold">✓ Cobrado</span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCobradoChange(record.id)}
                                    className="border-green-500 text-green-700 hover:bg-green-50"
                                  >
                                    Cobrar
                                  </Button>
                                )}
                              </td>
                              <td className="p-3">{record.facturaNumero || "-"}</td>
                              <td className="p-3">
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(record)}
                                    className="hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handlePrint(record)}
                                    className="hover:bg-blue-50"
                                  >
                                    <Printer className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(record.id)}
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
