import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import {
  cambiarRol,
  asignarCentroUsuario,
  aprobarUsuario,
  rechazarUsuario,
  resetearPassword,
  editarNombre,
} from "@/app/admin/actions";
import { ROL_USUARIO_VALUES, type Centro, type Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROL_BADGE: Record<string, string> = {
  admin: "border-marca/40 bg-marca/10 text-marca",
  responsable: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  donante: "border-slate-600 bg-slate-700/30 text-slate-300",
};

export default async function AdminUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: profilesData }, { data: centrosData }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("centros").select("id, nombre").order("nombre"),
  ]);

  const profiles = (profilesData ?? []) as Profile[];
  const centros = (centrosData ?? []) as Pick<Centro, "id" | "nombre">[];
  const centroNombre = new Map(centros.map((c) => [c.id, c.nombre]));

  const pendientes = profiles.filter((p) => p.estado === "pendiente");
  const activos = profiles.filter((p) => p.estado !== "pendiente");

  return (
    <div>
      <ErrorBanner message={error} />

      {/* ── Pendientes de aprobación ── */}
      {pendientes.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
              {pendientes.length}
            </span>
            <h2 className="text-lg font-semibold text-yellow-400">
              Pendientes de aprobación
            </h2>
          </div>

          <div className="space-y-3">
            {pendientes.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100">{p.nombre_completo}</p>
                    <p className="text-sm text-slate-400">{p.email}</p>
                    <p className="text-xs text-slate-500">
                      Cédula {p.cedula} · WhatsApp {p.telefono_whatsapp}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Registrado el{" "}
                      {new Date(p.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={aprobarUsuario}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-500 text-white border-0">
                        Aprobar
                      </Button>
                    </form>
                    <form action={rechazarUsuario}>
                      <input type="hidden" name="profile_id" value={p.id} />
                      <Button type="submit" variant="secondary" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
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

      {/* ── Usuarios activos / rechazados ── */}
      <h2 className="mb-1 text-lg font-semibold text-slate-100">Usuarios</h2>
      <p className="mb-5 text-sm text-slate-400">
        Cambia roles y vincula responsables a su centro. ({activos.length} usuarios)
      </p>

      <div className="space-y-3">
        {activos.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border p-4 ${
              p.estado === "rechazado"
                ? "border-red-500/20 bg-red-500/5"
                : "border-slate-800 bg-panel/60"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-100">{p.nombre_completo}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      ROL_BADGE[p.rol]
                    }`}
                  >
                    {p.rol}
                  </span>
                  {p.estado === "rechazado" && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                      rechazado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{p.email}</p>
                <p className="text-xs text-slate-500">
                  Cédula {p.cedula} · WhatsApp {p.telefono_whatsapp}
                  {p.rol === "responsable" && (
                    <>
                      {" · Centro: "}
                      <span className="text-slate-300">
                        {p.centro_id ? centroNombre.get(p.centro_id) ?? "—" : "sin asignar"}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Cambiar rol */}
                <form action={cambiarRol} className="flex items-center gap-2">
                  <input type="hidden" name="profile_id" value={p.id} />
                  <Select name="rol" defaultValue={p.rol} className="h-9 w-36">
                    {ROL_USUARIO_VALUES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" variant="secondary" size="sm">
                    Guardar rol
                  </Button>
                </form>

                {/* Asignar centro (solo si es responsable) */}
                {p.rol === "responsable" && (
                  <form action={asignarCentroUsuario} className="flex items-center gap-2">
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Select
                      name="centro_id"
                      defaultValue={p.centro_id ?? ""}
                      className="h-9 w-44"
                    >
                      <option value="">— Sin centro —</option>
                      {centros.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" variant="secondary" size="sm">
                      Vincular
                    </Button>
                  </form>
                )}

                {/* Editar nombre */}
                <form action={editarNombre} className="flex items-center gap-2">
                  <input type="hidden" name="profile_id" value={p.id} />
                  <input
                    type="text"
                    name="nombre_completo"
                    defaultValue={p.nombre_completo}
                    required
                    className="h-9 w-44 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Renombrar
                  </Button>
                </form>

                {/* Reset de contraseña */}
                <form action={resetearPassword} className="flex items-center gap-2">
                  <input type="hidden" name="profile_id" value={p.id} />
                  <input
                    type="password"
                    name="nueva_password"
                    placeholder="Nueva contraseña"
                    minLength={6}
                    required
                    className="h-9 w-40 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Reset pw
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
