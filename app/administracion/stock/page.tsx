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
import { Plus, Search, AlertTriangle, ShoppingCart, Mail, Edit, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: string
  nombre: string
  departamento: string
  cantidad_actual: number
  unidad: string
  ubicacion: string
  proveedor: string
  enlace_compra: string
  email_pedido: string
  frecuencia_pedido: string
  instrucciones_pedido: string
  stock_minimo: number
  ultima_entrada: string | null
  ultima_salida: string | null
  responsable: string
  notas: string
  hotel?: string
}

const DEPARTAMENTOS = ["Pisos", "Recepción", "Mantenimiento", "Cocina", "Bar", "Administración"]
const FRECUENCIAS = ["Mensual", "Semanal", "Quincenal", "Anual", "Bajo demanda"]
const UNIDADES = ["Unidades", "Litros", "Kilogramos", "Cajas", "Paquetes", "Metros"]
const HOTELES = ["Chi", "Caledonian"]

export default function StockManagement() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [hotelFilter, setHotelFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMovementDialog, setShowMovementDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [movementType, setMovementType] = useState<"entrada" | "salida">("entrada")
  const [movementQuantity, setMovementQuantity] = useState("")
  const [movementComment, setMovementComment] = useState("")

  // Form state for add/edit
  const [formData, setFormData] = useState({
    nombre: "",
    hotel: "",
    departamento: "",
    cantidad_actual: 0,
    unidad: "",
    ubicacion: "",
    proveedor: "",
    enlace_compra: "",
    email_pedido: "",
    frecuencia_pedido: "",
    instrucciones_pedido: "",
    stock_minimo: 0,
    responsable: "",
    notas: "",
  })

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, departmentFilter, hotelFilter])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("[v0] Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    if (hotelFilter !== "all") {
      filtered = filtered.filter((item) => item.hotel === hotelFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((item) => item.departamento === departmentFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.departamento.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredItems(filtered)
  }

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchItems()
        setShowAddDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Error adding item:", error)
    }
  }

  const handleEditItem = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchItems()
        setShowEditDialog(false)
        setSelectedItem(null)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Error editing item:", error)
    }
  }

  const handleMovement = async () => {
    if (!selectedItem || !movementQuantity) return

    try {
      const response = await fetch("/api/inventory/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventario_id: selectedItem.id,
          tipo: movementType,
          cantidad: Number.parseInt(movementQuantity),
          comentario: movementComment,
          usuario: "Admin", // TODO: Get from auth
        }),
      })

      if (response.ok) {
        await fetchItems()
        setShowMovementDialog(false)
        setSelectedItem(null)
        setMovementQuantity("")
        setMovementComment("")
      }
    } catch (error) {
      console.error("[v0] Error recording movement:", error)
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      nombre: item.nombre,
      hotel: item.hotel || "",
      departamento: item.departamento,
      cantidad_actual: item.cantidad_actual,
      unidad: item.unidad,
      ubicacion: item.ubicacion,
      proveedor: item.proveedor,
      enlace_compra: item.enlace_compra,
      email_pedido: item.email_pedido,
      frecuencia_pedido: item.frecuencia_pedido,
      instrucciones_pedido: item.instrucciones_pedido,
      stock_minimo: item.stock_minimo,
      responsable: item.responsable,
      notas: item.notas,
    })
    setShowEditDialog(true)
  }

  const openMovementDialog = (item: InventoryItem, type: "entrada" | "salida") => {
    setSelectedItem(item)
    setMovementType(type)
    setShowMovementDialog(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      hotel: "",
      departamento: "",
      cantidad_actual: 0,
      unidad: "",
      ubicacion: "",
      proveedor: "",
      enlace_compra: "",
      email_pedido: "",
      frecuencia_pedido: "",
      instrucciones_pedido: "",
      stock_minimo: 0,
      responsable: "",
      notas: "",
    })
  }

  const isLowStock = (item: InventoryItem) => item.cantidad_actual <= item.stock_minimo

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
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Stock</h1>
              <p className="text-slate-600">Control de inventario y pedidos</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Producto
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o categoría..."
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

        {/* Inventory Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Responsable</TableHead>
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
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={isLowStock(item) ? "bg-red-50" : ""}>
                      <TableCell>
                        {item.hotel ? (
                          <Badge variant="outline">{item.hotel}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isLowStock(item) && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          <span className="font-medium">{item.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.departamento}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={isLowStock(item) ? "text-red-600 font-bold" : ""}>
                            {item.cantidad_actual} {item.unidad}
                          </span>
                          <span className="text-xs text-slate-500">Mín: {item.stock_minimo}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.ubicacion}</TableCell>
                      <TableCell>{item.proveedor}</TableCell>
                      <TableCell>{item.frecuencia_pedido}</TableCell>
                      <TableCell>{item.responsable}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openMovementDialog(item, "entrada")}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openMovementDialog(item, "salida")}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {item.enlace_compra && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.enlace_compra, "_blank")}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          )}
                          {item.email_pedido && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`mailto:${item.email_pedido}`, "_blank")}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
              setSelectedItem(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditDialog ? "Editar Producto" : "Añadir Producto"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hotel *</Label>
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
                <Label>Nombre del Producto *</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Departamento *</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) => setFormData({ ...formData, departamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Cantidad Actual *</Label>
                <Input
                  type="number"
                  value={formData.cantidad_actual}
                  onChange={(e) => setFormData({ ...formData, cantidad_actual: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidad de Medida *</Label>
                <Select value={formData.unidad} onValueChange={(value) => setFormData({ ...formData, unidad: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Enlace de Compra</Label>
                <Input
                  value={formData.enlace_compra}
                  onChange={(e) => setFormData({ ...formData, enlace_compra: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Email de Pedido</Label>
                <Input
                  type="email"
                  value={formData.email_pedido}
                  onChange={(e) => setFormData({ ...formData, email_pedido: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Frecuencia de Pedido</Label>
                <Select
                  value={formData.frecuencia_pedido}
                  onValueChange={(value) => setFormData({ ...formData, frecuencia_pedido: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRECUENCIAS.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Mínimo *</Label>
                <Input
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Input
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Instrucciones de Pedido</Label>
                <Textarea
                  value={formData.instrucciones_pedido}
                  onChange={(e) => setFormData({ ...formData, instrucciones_pedido: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setShowEditDialog(false)
                  setSelectedItem(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={showEditDialog ? handleEditItem : handleAddItem}>
                {showEditDialog ? "Guardar Cambios" : "Añadir Producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Movement Dialog */}
        <Dialog
          open={showMovementDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowMovementDialog(false)
              setSelectedItem(null)
              setMovementQuantity("")
              setMovementComment("")
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{movementType === "entrada" ? "Registrar Entrada" : "Registrar Salida"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Producto</Label>
                <Input value={selectedItem?.nombre || ""} disabled />
              </div>
              <div>
                <Label>Cantidad *</Label>
                <Input
                  type="number"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Comentario</Label>
                <Textarea value={movementComment} onChange={(e) => setMovementComment(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMovementDialog(false)
                  setSelectedItem(null)
                  setMovementQuantity("")
                  setMovementComment("")
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleMovement}>Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
