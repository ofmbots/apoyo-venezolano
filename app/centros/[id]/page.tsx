import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MapPin, ClipboardList, Clock } from "lucide-react";
import { SugerenciaTelefonoForm } from "@/components/forms/SugerenciaTelefonoForm";
import { SolicitarEliminacionForm } from "@/components/forms/SolicitarEliminacionForm";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TIPO_CENTRO_COLOR,
  TIPO_CENTRO_LABEL,
  type Centro,
  type PrioridadSolicitud,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface InsumoAprobado {
  cantidad_necesaria: number;
  prioridad: PrioridadSolicitud;
  catalogo_insumos: { nombre: string; unidad: string } | null;
}

export default async function CentroDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: centro } = await supabase
    .from("centros")
    .select("*")
    .eq("id", id)
    .single();

  if (!centro) notFound();
  const c = centro as Centro;

  const { data: insumos } = await supabase
    .from("solicitudes_insumos")
    .select("cantidad_necesaria, prioridad, catalogo_insumos(nombre, unidad)")
    .eq("centro_id", id)
    .eq("estado_aprobacion", "aprobado")
    .order("prioridad", { ascending: true });

  const listaInsumos = (insumos ?? []) as unknown as InsumoAprobado[];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al mapa
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full ring-4 ring-white/5"
              style={{ backgroundColor: TIPO_CENTRO_COLOR[c.tipo] }}
            />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {TIPO_CENTRO_LABEL[c.tipo]}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-50">{c.nombre}</h1>

          {c.direccion && (
            <p className="mt-3 flex items-start gap-2 text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              {c.direccion}
            </p>
          )}

          {c.tipo === "temporal" && c.fecha_hasta && (
            <p className="mt-3 flex items-center gap-2 text-sm text-amber-400">
              <Clock className="h-4 w-4 shrink-0" />
              Operativo hasta el{" "}
              {new Date(c.fecha_hasta).toLocaleString("es-VE", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Caracas",
              })}
            </p>
          )}

          {c.telefono_contacto ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`tel:${c.telefono_contacto}`}>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" /> Llamar
                </Button>
              </a>
            </div>
          ) : (
            <SugerenciaTelefonoForm centroId={c.id} centroNombre={c.nombre} />
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Insumos que necesita</h2>
        <Link href={`/solicitar?centro=${c.id}`}>
          <Button variant="outline" size="sm">
            <ClipboardList className="h-4 w-4" /> Registrar necesidad
          </Button>
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {listaInsumos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Este centro todavía no tiene insumos aprobados.
            </CardContent>
          </Card>
        ) : (
          listaInsumos.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-panel/60 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-100">
                  {s.catalogo_insumos?.nombre ?? "Insumo"}
                </p>
                <p className="text-sm text-slate-500">
                  {s.cantidad_necesaria} {s.catalogo_insumos?.unidad ?? "unidad"}
                </p>
              </div>
              {s.prioridad === "urgente" && (
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                  Urgente
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Solicitar eliminación */}
      <div className="mt-8">
        <SolicitarEliminacionForm centroId={c.id} centroNombre={c.nombre} />
      </div>
    </div>
  );
}
