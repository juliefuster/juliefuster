"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Save, X, Upload, Trash2, Clock, ImageIcon, ChevronDown, ChevronUp, Eye } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"

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

interface Photo {
  id: string
  guia_id: string
  url: string
  descripcion: string
  fecha_subida: string
  subido_por: string
}

interface HistoryEntry {
  id: string
  guia_id: string
  fecha: string
  modificado_por: string
  cambio: string
  contenido_anterior_titulo?: string
  contenido_anterior_descripcion?: string
  contenido_anterior_departamento?: string
  contenido_anterior_hotel?: string
}

export default function GuiaDetailPage() {
  const params = useParams()
  const guideId = params.id as string

  const [guide, setGuide] = useState<Guide | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [editedGuide, setEditedGuide] = useState({
    titulo: "",
    descripcion: "",
    departamento: "",
    hotel: "",
    modificado_por: "",
  })

  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    descripcion: "",
    subido_por: "",
  })

  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [viewingVersion, setViewingVersion] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    if (guideId) {
      fetchGuideDetails()
    }
  }, [guideId])

  const fetchGuideDetails = async () => {
    try {
      const [guideRes, photosRes, historyRes] = await Promise.all([
        fetch(`/api/guia-virtual/${guideId}`),
        fetch(`/api/guia-virtual/${guideId}/fotos`),
        fetch(`/api/guia-virtual/${guideId}/historial`),
      ])

      if (guideRes.ok) {
        const guideData = await guideRes.json()
        setGuide(guideData)
        setEditedGuide({
          titulo: guideData.titulo || "",
          descripcion: guideData.descripcion || "",
          departamento: guideData.departamento || "",
          hotel: guideData.hotel || "",
          modificado_por: guideData.modificado_por || "",
        })
      }

      if (photosRes.ok) {
        const photosData = await photosRes.json()
        setPhotos(photosData)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData)
      }
    } catch (error) {
      console.error("Error fetching guide details:", error)
    }
  }

  const handleSave = async () => {
    if (!editedGuide.titulo || !editedGuide.modificado_por) {
      toast({
        title: "Error",
        description: "Título y nombre del modificador son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/guia-virtual/${guideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedGuide,
          cambio: "Guía actualizada",
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Guía actualizada correctamente",
        })
        setIsEditing(false)
        fetchGuideDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la guía",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadPhoto = async () => {
    if (!uploadData.file || !uploadData.subido_por) {
      toast({
        title: "Error",
        description: "Selecciona un archivo y escribe tu nombre",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      // Upload to Supabase Storage
      const fileExt = uploadData.file.name.split(".").pop()
      const fileName = `${guideId}/${Date.now()}.${fileExt}`

      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from("guia-virtual-fotos")
        .upload(fileName, uploadData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("guia-virtual-fotos").getPublicUrl(fileName)

      // Save to database
      const response = await fetch(`/api/guia-virtual/${guideId}/fotos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlData.publicUrl,
          descripcion: uploadData.descripcion,
          subido_por: uploadData.subido_por,
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Foto subida correctamente",
        })
        setIsUploadDialogOpen(false)
        setUploadData({ file: null, descripcion: "", subido_por: "" })
        fetchGuideDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir la foto",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!confirm("¿Estás seguro de eliminar esta foto?")) return

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      // Extract file path from URL
      const urlParts = photoUrl.split("/guia-virtual-fotos/")
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split("?")[0]
        await supabase.storage.from("guia-virtual-fotos").remove([filePath])
      }

      // Delete from database
      const response = await fetch(`/api/guia-virtual/${guideId}/fotos?photoId=${photoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Foto eliminada correctamente",
        })
        fetchGuideDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la foto",
        variant: "destructive",
      })
    }
  }

  const toggleHistoryExpansion = (id: string) => {
    setExpandedHistoryId(expandedHistoryId === id ? null : id)
  }

  const viewPreviousVersion = (entry: HistoryEntry) => {
    setViewingVersion(entry)
  }

  const restorePreviousVersion = async (entry: HistoryEntry) => {
    if (!confirm("¿Restaurar esta versión anterior? Esto creará una nueva entrada en el historial.")) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/guia-virtual/${guideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: entry.contenido_anterior_titulo || guide?.titulo,
          descripcion: entry.contenido_anterior_descripcion || guide?.descripcion,
          departamento: entry.contenido_anterior_departamento || guide?.departamento,
          hotel: entry.contenido_anterior_hotel || guide?.hotel,
          modificado_por: editedGuide.modificado_por || "Sistema",
          cambio: `Versión restaurada del ${new Date(entry.fecha).toLocaleString()}`,
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Versión anterior restaurada correctamente",
        })
        setViewingVersion(null)
        fetchGuideDetails()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al restaurar la versión",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/administracion/guia-virtual">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Guías
            </Button>
          </Link>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Guía
            </Button>
          )}
        </div>

        {/* Guide Content */}
        <Card className="p-8 mb-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editedGuide.titulo}
                  onChange={(e) => setEditedGuide({ ...editedGuide, titulo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hotel</Label>
                  <Select
                    value={editedGuide.hotel}
                    onValueChange={(value) => setEditedGuide({ ...editedGuide, hotel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                    value={editedGuide.departamento}
                    onValueChange={(value) => setEditedGuide({ ...editedGuide, departamento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  value={editedGuide.descripcion}
                  onChange={(e) => setEditedGuide({ ...editedGuide, descripcion: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Tu nombre *</Label>
                <Input
                  value={editedGuide.modificado_por}
                  onChange={(e) => setEditedGuide({ ...editedGuide, modificado_por: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{guide.titulo}</h1>
                <div className="flex gap-2">
                  {guide.hotel && <Badge className={`${getHotelColor(guide.hotel)} text-white`}>{guide.hotel}</Badge>}
                  {guide.departamento && (
                    <Badge className={`${getDepartmentColor(guide.departamento)} text-white`}>
                      {guide.departamento}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{guide.descripcion}</p>
              </div>

              <div className="mt-6 pt-6 border-t text-sm text-slate-600">
                <p>
                  <strong>Última modificación:</strong> {new Date(guide.ultima_modificacion).toLocaleString()} por{" "}
                  {guide.modificado_por}
                </p>
              </div>
            </>
          )}
        </Card>

        {/* Photos Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Fotos</h2>
            <Button onClick={() => setIsUploadDialogOpen(true)} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Subir Foto
            </Button>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay fotos adjuntas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.descripcion || "Foto de guía"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(photo.id, photo.url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {photo.descripcion && <p className="text-sm text-slate-600 mt-2">{photo.descripcion}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* History Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Versiones
          </h2>

          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No hay cambios registrados</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer"
                    onClick={() => toggleHistoryExpansion(entry.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          v{history.length - index}
                        </Badge>
                        <p className="text-slate-900 font-medium">{entry.cambio}</p>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(entry.fecha).toLocaleString()} - {entry.modificado_por}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.contenido_anterior_titulo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            viewPreviousVersion(entry)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver versión
                        </Button>
                      )}
                      {expandedHistoryId === entry.id ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {expandedHistoryId === entry.id && entry.contenido_anterior_titulo && (
                    <div className="p-4 bg-white border-t">
                      <h4 className="font-semibold text-slate-700 mb-2">Contenido de esta versión:</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Título: </span>
                          <span className="text-slate-900">{entry.contenido_anterior_titulo}</span>
                        </div>
                        {entry.contenido_anterior_hotel && (
                          <div>
                            <span className="font-medium text-slate-600">Hotel: </span>
                            <Badge className={`${getHotelColor(entry.contenido_anterior_hotel)} text-white text-xs`}>
                              {entry.contenido_anterior_hotel}
                            </Badge>
                          </div>
                        )}
                        {entry.contenido_anterior_departamento && (
                          <div>
                            <span className="font-medium text-slate-600">Departamento: </span>
                            <Badge
                              className={`${getDepartmentColor(entry.contenido_anterior_departamento)} text-white text-xs`}
                            >
                              {entry.contenido_anterior_departamento}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-slate-600">Descripción: </span>
                          <p className="text-slate-900 whitespace-pre-wrap mt-1 p-3 bg-slate-50 rounded border">
                            {entry.contenido_anterior_descripcion || "Sin descripción"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dialog to view previous versions */}
        <Dialog open={viewingVersion !== null} onOpenChange={() => setViewingVersion(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Vista previa de versión anterior
              </DialogTitle>
            </DialogHeader>
            {viewingVersion && (
              <div className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Versión del:</strong> {new Date(viewingVersion.fecha).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Modificado por:</strong> {viewingVersion.modificado_por}
                  </p>
                </div>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {viewingVersion.contenido_anterior_titulo || "Sin título"}
                    </h1>
                    <div className="flex gap-2">
                      {viewingVersion.contenido_anterior_hotel && (
                        <Badge className={`${getHotelColor(viewingVersion.contenido_anterior_hotel)} text-white`}>
                          {viewingVersion.contenido_anterior_hotel}
                        </Badge>
                      )}
                      {viewingVersion.contenido_anterior_departamento && (
                        <Badge
                          className={`${getDepartmentColor(viewingVersion.contenido_anterior_departamento)} text-white`}
                        >
                          {viewingVersion.contenido_anterior_departamento}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {viewingVersion.contenido_anterior_descripcion || "Sin descripción"}
                    </p>
                  </div>
                </Card>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewingVersion(null)}>
                    Cerrar
                  </Button>
                  <Button onClick={() => restorePreviousVersion(viewingVersion)} disabled={isSaving}>
                    {isSaving ? "Restaurando..." : "Restaurar esta versión"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog to upload photo */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Nueva Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Archivo *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setUploadData({ ...uploadData, file })
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={uploadData.descripcion}
                  onChange={(e) => setUploadData({ ...uploadData, descripcion: e.target.value })}
                  placeholder="Descripción de la foto (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Tu nombre *</Label>
                <Input
                  value={uploadData.subido_por}
                  onChange={(e) => setUploadData({ ...uploadData, subido_por: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUploadPhoto} disabled={isUploading}>
                  {isUploading ? "Subiendo..." : "Subir Foto"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
