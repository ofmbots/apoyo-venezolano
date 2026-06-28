import { Check, X, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { resolverSolicitud } from "@/app/admin/actions";
import type { EstadoAprobacion, PrioridadSolicitud } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Fila {
  id: string;
  cantidad_necesaria: number;
  prioridad: PrioridadSolicitud;
  estado_aprobacion: EstadoAprobacion;
  fecha_creacion: string;
  centros: { nombre: string } | null;
  catalogo_insumos: { nombre: string; unidad: string } | null;
}

const ESTADO_BADGE: Record<EstadoAprobacion, string> = {
  pendiente: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  aprobado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rechazado: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default async function AdminSolicitudes({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("solicitudes_insumos")
    .select(
      "id, cantidad_necesaria, prioridad, estado_aprobacion, fecha_creacion, centros(nombre), catalogo_insumos(nombre, unidad)"
    )
    .order("fecha_creacion", { ascending: false });

  const filas = (data ?? []) as unknown as Fila[];
  const pendientes = filas.filter((f) => f.estado_aprobacion === "pendiente");
  const resto = filas.filter((f) => f.estado_aprobacion !== "pendiente");

  return (
    <div>
      <ErrorBanner message={error} />

      <h2 className="mb-1 text-lg font-semibold text-slate-100">Solicitudes de insumo</h2>
      <p className="mb-5 text-sm text-slate-400">
        Aprueba o rechaza las solicitudes pendientes. Al aprobar, el insumo aparece público
        en el centro.
      </p>

      {/* Pendientes */}
      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-400">
          <Clock className="h-4 w-4" /> Pendientes ({pendientes.length})
        </h3>

        {pendientes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            No hay solicitudes pendientes. 🎉
          </p>
        ) : (
          <div className="space-y-2">
            {pendientes.map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-panel/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-100">
                    {f.catalogo_insumos?.nombre ?? "Insumo"}{" "}
                    <span className="text-slate-400">
                      · {f.cantidad_necesaria} {f.catalogo_insumos?.unidad}
                    </span>
                    {f.prioridad === "urgente" && (
                      <span className="ml-2 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                        Urgente
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{f.centros?.nombre ?? "—"}</p>
                </div>
                <div className="flex gap-2">
                  <form action={resolverSolicitud}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="accion" value="aprobar" />
                    <Button
                      size="sm"
                      className="bg-emerald-500 text-slate-950 shadow-none hover:bg-emerald-400"
                    >
                      <Check className="h-4 w-4" /> Aprobar
                    </Button>
                  </form>
                  <form action={resolverSolicitud}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="accion" value="rechazar" />
                    <Button size="sm" variant="outline">
                      <X className="h-4 w-4" /> Rechazar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Historial ({resto.length})
        </h3>
        {resto.length === 0 ? (
          <p className="text-sm text-slate-500">Sin solicitudes resueltas todavía.</p>
        ) : (
          <div className="space-y-2">
            {resto.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-panel/40 px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <span className="text-slate-200">{f.catalogo_insumos?.nombre}</span>
                  <span className="text-slate-500"> · {f.centros?.nombre}</span>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    ESTADO_BADGE[f.estado_aprobacion]
                  }`}
                >
                  {f.estado_aprobacion}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
