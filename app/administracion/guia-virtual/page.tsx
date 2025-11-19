"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Guide {
  id: string
  titulo: string
  descripcion: string
  departamento: string
  hotel: string
  fecha_creacion: string
  ultima_modificacion: string
  modificado_por: string
}

export default function GuiaVirtualPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hotelFilter, setHotelFilter] = useState("Todos")
  const [departamentoFilter, setDepartamentoFilter] = useState("Todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [newGuide, setNewGuide] = useState({
    titulo: "",
    descripcion: "",
    departamento: "",
    hotel: "",
    modificado_por: "",
  })

  useEffect(() => {
    fetchGuides()
  }, [])

  useEffect(() => {
    filterGuides()
  }, [searchQuery, hotelFilter, departamentoFilter, guides])

  const fetchGuides = async () => {
    try {
      const response = await fetch("/api/guia-virtual")
      if (response.ok) {
        const data = await response.json()
        setGuides(data)
      }
    } catch (error) {
      console.error("Error fetching guides:", error)
    }
  }

  const filterGuides = () => {
    let filtered = guides

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (guide) =>
          guide.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Hotel filter
    if (hotelFilter !== "Todos") {
      filtered = filtered.filter((guide) => guide.hotel === hotelFilter || guide.hotel === "Ambos")
    }

    // Departamento filter
    if (departamentoFilter !== "Todos") {
      filtered = filtered.filter((guide) => guide.departamento === departamentoFilter)
    }

    setFilteredGuides(filtered)
  }

  const handleAddGuide = async () => {
    if (!newGuide.titulo || !newGuide.modificado_por) {
      toast({
        title: "Error",
        description: "Título y nombre del modificador son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/guia-virtual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGuide),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Guía creada correctamente",
        })
        setIsAddDialogOpen(false)
        setNewGuide({
          titulo: "",
          descripcion: "",
          departamento: "",
          hotel: "",
          modificado_por: "",
        })
        fetchGuides()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la guía",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      Recepción: "bg-blue-500",
      Mantenimiento: "bg-orange-500",
      Pisos: "bg-green-500",
      Desayunos: "bg-yellow-500",
      Administración: "bg-purple-500",
      Informática: "bg-cyan-500",
      Otro: "bg-gray-500",
    }
    return colors[dept] || "bg-gray-500"
  }

  const getHotelColor = (hotel: string) => {
    const colors: Record<string, string> = {
      Chi: "bg-rose-500",
      Caledonian: "bg-indigo-500",
      Ambos: "bg-teal-500",
    }
    return colors[hotel] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/administracion">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Administración
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-purple-600 rounded-2xl mb-4">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Guía Virtual</h1>
          <p className="text-lg text-slate-600">Busca procedimientos, pasos y documentación interna</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Buscar</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Escribe una palabra clave (ej: fumigación, extintores...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Hotel</Label>
              <Select value={hotelFilter} onValueChange={setHotelFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Chi">Chi</SelectItem>
                  <SelectItem value="Caledonian">Caledonian</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Departamento</Label>
              <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Recepción">Recepción</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Pisos">Pisos</SelectItem>
                  <SelectItem value="Desayunos">Desayunos</SelectItem>
                  <SelectItem value="Administración">Administración</SelectItem>
                  <SelectItem value="Informática">Informática</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Guía
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Guía</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      value={newGuide.titulo}
                      onChange={(e) => setNewGuide({ ...newGuide, titulo: e.target.value })}
                      placeholder="Ej: Procedimiento de fumigación"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hotel</Label>
                      <Select
                        value={newGuide.hotel}
                        onValueChange={(value) => setNewGuide({ ...newGuide, hotel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hotel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chi">Chi</SelectItem>
                          <SelectItem value="Caledonian">Caledonian</SelectItem>
                          <SelectItem value="Ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <Select
                        value={newGuide.departamento}
                        onValueChange={(value) => setNewGuide({ ...newGuide, departamento: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Recepción">Recepción</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Pisos">Pisos</SelectItem>
                          <SelectItem value="Desayunos">Desayunos</SelectItem>
                          <SelectItem value="Administración">Administración</SelectItem>
                          <SelectItem value="Informática">Informática</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={newGuide.descripcion}
                      onChange={(e) => setNewGuide({ ...newGuide, descripcion: e.target.value })}
                      placeholder="Describe el procedimiento, pasos a seguir, etc."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tu nombre *</Label>
                    <Input
                      value={newGuide.modificado_por}
                      onChange={(e) => setNewGuide({ ...newGuide, modificado_por: e.target.value })}
                      placeholder="Nombre del creador"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddGuide} disabled={isLoading}>
                      {isLoading ? "Creando..." : "Crear Guía"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4 text-slate-600">
          {filteredGuides.length} resultado{filteredGuides.length !== 1 ? "s" : ""} encontrado
          {filteredGuides.length !== 1 ? "s" : ""}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => (
            <Link key={guide.id} href={`/administracion/guia-virtual/${guide.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{guide.titulo || "Sin título"}</h3>

                  <div className="flex flex-wrap gap-2">
                    {guide.hotel && <Badge className={`${getHotelColor(guide.hotel)} text-white`}>{guide.hotel}</Badge>}
                    {guide.departamento && (
                      <Badge className={`${getDepartmentColor(guide.departamento)} text-white`}>
                        {guide.departamento}
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-3">{guide.descripcion || "Sin descripción"}</p>

                  <div className="text-xs text-slate-500 mt-auto">
                    Modificado: {new Date(guide.ultima_modificacion).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron guías</h3>
            <p className="text-slate-600">Intenta con otras palabras clave o crea una nueva guía</p>
          </Card>
        )}
      </div>
    </div>
  )
}
