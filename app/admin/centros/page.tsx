import Link from "next/link";
import { Plus, Power, PowerOff, UserCheck, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { cambiarEstadoCentro, asignarResponsable } from "@/app/admin/actions";
import { TIPO_CENTRO_COLOR, TIPO_CENTRO_LABEL, type Centro } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProfileMini {
  id: string;
  nombre_completo: string;
  email: string;
}

export default async function AdminCentros({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: centrosData }, { data: profilesData }] = await Promise.all([
    supabase.from("centros").select("*").order("nombre"),
    supabase.from("profiles").select("id, nombre_completo, email").order("nombre_completo"),
  ]);

  const todos    = (centrosData ?? []) as Centro[];
  const profiles = (profilesData ?? []) as ProfileMini[];
  const nombrePorId = new Map(profiles.map((p) => [p.id, p.nombre_completo]));

  const pendientes = todos.filter((c) => c.estado === "pendiente");
  const resto      = todos.filter((c) => c.estado !== "pendiente");

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />

      {/* ── Solicitudes pendientes ── */}
      {pendientes.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-amber-300">
              Solicitudes pendientes ({pendientes.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendientes.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: TIPO_CENTRO_COLOR[c.tipo] }}
                      />
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {TIPO_CENTRO_LABEL[c.tipo]}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-slate-100">{c.nombre}</p>
                    {c.direccion && (
                      <p className="text-sm text-slate-500">{c.direccion}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-600">
                      {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={cambiarEstadoCentro}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="estado" value="activo" />
                      <Button type="submit" size="sm">
                        <Power className="h-4 w-4" /> Aprobar
                      </Button>
                    </form>
                    <form action={cambiarEstadoCentro}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="estado" value="cerrado" />
                      <Button type="submit" variant="outline" size="sm">
                        Rechazar
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Centros activos / cerrados ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Centros</h2>
          <Link href="/centros/nuevo">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Nuevo centro
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {resto.length === 0 ? (
            <p className="text-sm text-slate-500">No hay centros.</p>
          ) : (
            resto.map((c) => {
              const activo = c.estado === "activo";
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-800 bg-panel/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: TIPO_CENTRO_COLOR[c.tipo] }}
                        />
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {TIPO_CENTRO_LABEL[c.tipo]}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            activo
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-600 bg-slate-700/30 text-slate-400"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </div>
                      <Link
                        href={`/centros/${c.id}`}
                        className="mt-1 block font-semibold text-slate-100 hover:text-marca"
                      >
                        {c.nombre}
                      </Link>
                      {c.direccion && (
                        <p className="text-sm text-slate-500">{c.direccion}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Responsable:{" "}
                        <span className="text-slate-300">
                          {c.responsable_id
                            ? nombrePorId.get(c.responsable_id) ?? "—"
                            : "sin asignar"}
                        </span>
                      </p>
                    </div>

                    <form action={cambiarEstadoCentro}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="estado" value={activo ? "cerrado" : "activo"} />
                      <Button type="submit" variant="outline" size="sm">
                        {activo ? (
                          <><PowerOff className="h-4 w-4" /> Cerrar</>
                        ) : (
                          <><Power className="h-4 w-4" /> Activar</>
                        )}
                      </Button>
                    </form>
                  </div>

                  <form
                    action={asignarResponsable}
                    className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3"
                  >
                    <input type="hidden" name="centro_id" value={c.id} />
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <Select
                      name="profile_id"
                      defaultValue={c.responsable_id ?? ""}
                      className="h-9 max-w-xs flex-1"
                    >
                      <option value="">— Sin responsable —</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre_completo} ({p.email})
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" variant="secondary" size="sm">
                      Asignar
                    </Button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
