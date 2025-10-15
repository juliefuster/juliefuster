"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, User, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Estructura REAL de la tabla fumigation_records */
type FumigationRow = {
  id: number;
  hotel: string;
  date: string;            // YYYY-MM-DD
  operator_name: string;
  observations: string | null;
  next_date?: string | null;
  created_at?: string | null;
};

/** Para pintar por si tu API devuelve otras claves antiguas */
function normalize(row: any): FumigationRow {
  // Acepta también nombres antiguos: fumigatedAt, operatorName, etc.
  const date =
    row?.date ??
    row?.fumigatedAt ??
    row?.fumigationDate ??
    row?.created_at ??
    null;

  const operator_name =
    row?.operator_name ?? row?.operatorName ?? row?.responsable ?? "";

  return {
    id: Number(row?.id ?? 0),
    hotel: String(row?.hotel ?? ""),
    date: date ? new Date(date).toISOString().slice(0, 10) : "",
    operator_name,
    observations: row?.observations ?? row?.comentarios ?? null,
    next_date: row?.next_date ?? null,
    created_at: row?.created_at ?? null,
  };
}

export default function FumigationHistory() {
  const params = useParams();
  const hotel = (params?.hotel as string) || "chi";
  const hotelName = hotel === "caledonian" ? "Hotel Caledonian" : "Hotel Chi";

  const [records, setRecords] = useState<FumigationRow[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FumigationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Formulario para crear registro sencillo
  const [fumigationDate, setFumigationDate] = useState("");
  const [responsible, setResponsible] = useState("");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredRecords(
      records.filter(
        (r) =>
          r.operator_name?.toLowerCase().includes(term) ||
          (r.observations ?? "").toLowerCase().includes(term)
      )
    );
  }, [searchTerm, records]);

  async function fetchRecords() {
    try {
      setLoading(true);
      const res = await fetch(`/api/fumigation?hotel=${encodeURIComponent(hotel)}`);
      if (!res.ok) throw new Error(`GET /api/fumigation ${res.status}`);
      const raw = await res.json();
      const list: FumigationRow[] = Array.isArray(raw)
        ? raw.map(normalize)
        : Array.isArray(raw?.data)
        ? raw.data.map(normalize)
        : [];
      setRecords(list);
      setFilteredRecords(list);
    } catch (err) {
      console.error("Error fetching fumigation records:", err);
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!fumigationDate || !responsible) {
      alert("Por favor completa la fecha y el responsable.");
      return;
    }

    const payload = {
      hotel,
      date: fumigationDate,          // YYYY-MM-DD
      operator_name: responsible,    // coincide con la columna
      observations: observations || "",
    };

    try {
      const res = await fetch("/api/fumigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        console.error("❌ Error POST /api/fumigation:", err);
        alert("Error al registrar la fumigación");
        return;
      }

      // Limpia el form y recarga
      setFumigationDate("");
      setResponsible("");
      setObservations("");
      await fetchRecords();
      alert("Registro guardado con éxito");
    } catch (err) {
      console.error("💥 Error inesperado guardando fumigación:", err);
      alert("Error al registrar la fumigación");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}/preventivo`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Historial de Fumigaciones
              </h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Formulario simple */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Registrar nueva fumigación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">
                Fecha de fumigación
              </label>
              <Input
                type="date"
                value={fumigationDate}
                onChange={(e) => setFumigationDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">
                Responsable
              </label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nombre del operario"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">
                Observaciones
              </label>
              <Input
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Comentarios opcionales"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </Card>

        {/* Buscador */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por responsable u observaciones…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        <p className="text-sm text-slate-600">
          Mostrando {filteredRecords.length} de {records.length} registros
        </p>

        {/* Lista */}
        {filteredRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🪳</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No hay registros
            </h3>
            <p className="text-slate-600">
              {searchTerm
                ? "No se encontraron registros con ese criterio de búsqueda"
                : "Aún no hay fumigaciones registradas"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((r) => (
              <Card key={r.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🪳</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-900">
                        {r.date
                          ? new Date(r.date).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">
                        {r.operator_name || "Sin responsable"}
                      </span>
                    </div>

                    {r.observations && r.observations.trim() !== "" && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">
                              Observaciones:
                            </p>
                            <p className="text-sm text-slate-700">
                              {r.observations}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/** Intenta parsear JSON sin romper si respuesta vacía */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
