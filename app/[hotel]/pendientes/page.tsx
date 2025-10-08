"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, User, AlertCircle, Printer } from "lucide-react";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  reported_by: string;
  created_at: string;
}

export default function PendingIssues() {
  const params = useParams();
  const hotel = params.hotel as string;
  const hotelName =
    hotel === "caledonian"
      ? "Hotel Caledonian"
      : hotel === "chi"
      ? "Hotel Chi"
      : "Hotel Desconocido";

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`/api/maintenance/pending?hotel=${hotel}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setIssues(data);
        } else {
          setIssues([]); // seguridad si devuelve objeto
        }
      } catch (error) {
        console.error("Error cargando averías pendientes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hotel) fetchIssues();
  }, [hotel]);

  const handlePrint = () => {
    window.print();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 🔹 CABECERA */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/${hotel}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Averías Pendientes</h1>
              <p className="text-sm text-slate-600">{hotelName}</p>
            </div>
          </div>

          <Button onClick={handlePrint} variant="outline" className="bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* 🔹 CONTENIDO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-600">Cargando averías...</div>
        ) : issues.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay averías pendientes</h3>
            <p className="text-slate-600">Todas las averías han sido resueltas 🎉</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {issues.map((issue) => (
              <Card key={issue.id} className="p-6 bg-white border-l-4 border-yellow-400">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority?.toUpperCase() || "SIN PRIORIDAD"}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        PENDIENTE
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {issue.title || "Sin título"}
                    </h3>
                    <p className="text-slate-600 mb-4">{issue.description || "Sin descripción"}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {issue.location || "Ubicación no especificada"}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {issue.reported_by || "Desconocido"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(issue.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </div>
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
