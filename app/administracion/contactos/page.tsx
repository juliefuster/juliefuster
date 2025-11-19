"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Contacto {
  id: string
  tipo_contacto?: string
  nombre?: string
  apellido?: string
  cargo?: string
  empresa?: string
  telefono?: string
  email?: string
  direccion?: string
  departamento?: string
  hotel?: string
  notas?: string
  fecha_creacion: string
}

const TIPOS = ["Persona", "Empresa"]
const DEPARTAMENTOS = ["Recepción", "Mantenimiento", "Pisos", "Desayunos", "Administración", "Otro"]
const HOTELES = ["Chi", "Caledonian", "Ambos"]

export default function ContactosManagement() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [filteredContactos, setFilteredContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [hotelFilter, setHotelFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null)

  const [formData, setFormData] = useState({
    tipo_contacto: "",
    nombre: "",
    apellido: "",
    cargo: "",
    empresa: "",
    telefono: "",
    email: "",
    direccion: "",
    departamento: "",
    hotel: "",
    notas: "",
  })

  useEffect(() => {
    fetchContactos()
  }, [])

  useEffect(() => {
    filterContactos()
  }, [contactos, searchTerm, hotelFilter, departmentFilter])

  const fetchContactos = async () => {
    try {
      const response = await fetch("/api/contactos")
      const data = await response.json()
      setContactos(data)
    } catch (error) {
      console.error("[v0] Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterContactos = () => {
    let filtered = contactos

    if (hotelFilter !== "all") {
      filtered = filtered.filter((contacto) => contacto.hotel === hotelFilter || contacto.hotel === "Ambos")
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((contacto) => contacto.departamento === departmentFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (contacto) =>
          contacto.nombre?.toLowerCase().includes(term) ||
          contacto.apellido?.toLowerCase().includes(term) ||
          contacto.empresa?.toLowerCase().includes(term) ||
          contacto.email?.toLowerCase().includes(term) ||
          contacto.telefono?.includes(term),
      )
    }

    setFilteredContactos(filtered)
  }

  const handleAddContacto = async () => {
    try {
      const response = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContactos()
        setShowAddDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Error adding contact:", error)
    }
  }

  const handleEditContacto = async () => {
    if (!selectedContacto) return

    try {
      const response = await fetch(`/api/contactos/${selectedContacto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContactos()
        setShowEditDialog(false)
        setSelectedContacto(null)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Error editing contact:", error)
    }
  }

  const openEditDialog = (contacto: Contacto) => {
    setSelectedContacto(contacto)
    setFormData({
      tipo_contacto: contacto.tipo_contacto || "",
      nombre: contacto.nombre || "",
      apellido: contacto.apellido || "",
      cargo: contacto.cargo || "",
      empresa: contacto.empresa || "",
      telefono: contacto.telefono || "",
      email: contacto.email || "",
      direccion: contacto.direccion || "",
      departamento: contacto.departamento || "",
      hotel: contacto.hotel || "",
      notas: contacto.notas || "",
    })
    setShowEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      tipo_contacto: "",
      nombre: "",
      apellido: "",
      cargo: "",
      empresa: "",
      telefono: "",
      email: "",
      direccion: "",
      departamento: "",
      hotel: "",
      notas: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/administracion">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Contactos</h1>
              <p className="text-slate-600">Base de datos de contactos y proveedores</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Contacto
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, empresa, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={hotelFilter} onValueChange={setHotelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los hoteles</SelectItem>
                {HOTELES.map((hotel) => (
                  <SelectItem key={hotel} value={hotel}>
                    {hotel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {DEPARTAMENTOS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Contacts Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredContactos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No se encontraron contactos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContactos.map((contacto) => (
                    <TableRow key={contacto.id}>
                      <TableCell>
                        {contacto.tipo_contacto && (
                          <Badge variant={contacto.tipo_contacto === "Persona" ? "default" : "secondary"}>
                            {contacto.tipo_contacto}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {contacto.nombre} {contacto.apellido}
                        </div>
                      </TableCell>
                      <TableCell>{contacto.empresa || "-"}</TableCell>
                      <TableCell>{contacto.cargo || "-"}</TableCell>
                      <TableCell>{contacto.telefono || "-"}</TableCell>
                      <TableCell>
                        {contacto.email ? (
                          <a href={`mailto:${contacto.email}`} className="text-blue-600 hover:underline">
                            {contacto.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {contacto.departamento && <Badge variant="outline">{contacto.departamento}</Badge>}
                      </TableCell>
                      <TableCell>{contacto.hotel && <Badge variant="outline">{contacto.hotel}</Badge>}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(contacto)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={showAddDialog || showEditDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false)
              setShowEditDialog(false)
              setSelectedContacto(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditDialog ? "Editar Contacto" : "Añadir Contacto"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tipo de Contacto</Label>
                <Select
                  value={formData.tipo_contacto}
                  onValueChange={(value) => setFormData({ ...formData, tipo_contacto: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hotel</Label>
                <Select value={formData.hotel} onValueChange={(value) => setFormData({ ...formData, hotel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOTELES.map((hotel) => (
                      <SelectItem key={hotel} value={hotel}>
                        {hotel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) => setFormData({ ...formData, departamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setShowEditDialog(false)
                  setSelectedContacto(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={showEditDialog ? handleEditContacto : handleAddContacto}>
                {showEditDialog ? "Guardar Cambios" : "Añadir Contacto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
