import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { cambiarRol, asignarCentroUsuario } from "@/app/admin/actions";
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

  return (
    <div>
      <ErrorBanner message={error} />

      <h2 className="mb-1 text-lg font-semibold text-slate-100">Usuarios</h2>
      <p className="mb-5 text-sm text-slate-400">
        Cambia roles y vincula responsables a su centro. ({profiles.length} usuarios)
      </p>

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-800 bg-panel/60 p-4">
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
