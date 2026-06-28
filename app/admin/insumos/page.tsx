import { Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { crearInsumo, editarInsumo, eliminarInsumo } from "@/app/admin/actions";
import {
  CATEGORIA_INSUMO_LABEL,
  CATEGORIA_INSUMO_VALUES,
  type CatalogoInsumo,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInsumos({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("catalogo_insumos")
    .select("*")
    .order("categoria")
    .order("nombre");

  const insumos = (data ?? []) as CatalogoInsumo[];

  return (
    <div>
      <ErrorBanner message={error} />

      <h2 className="mb-1 text-lg font-semibold text-slate-100">Catálogo de insumos</h2>
      <p className="mb-5 text-sm text-slate-400">
        Añade, edita o elimina los insumos que los centros pueden solicitar.
      </p>

      {/* Añadir */}
      <form
        action={crearInsumo}
        className="mb-6 rounded-2xl border border-slate-800 bg-panel/70 p-4"
      >
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Plus className="h-4 w-4 text-marca" /> Nuevo insumo
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_120px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required placeholder="Ej: Agua potable" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoría</Label>
            <Select id="categoria" name="categoria" defaultValue="otro">
              {CATEGORIA_INSUMO_VALUES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_INSUMO_LABEL[c]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unidad">Unidad</Label>
            <Input id="unidad" name="unidad" defaultValue="unidad" />
          </div>
          <Button type="submit">Añadir</Button>
        </div>
      </form>

      {/* Listado editable */}
      <div className="space-y-2">
        {insumos.length === 0 ? (
          <p className="text-sm text-slate-500">No hay insumos en el catálogo.</p>
        ) : (
          insumos.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-slate-800 bg-panel/50 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_160px_120px_auto_auto] sm:items-center">
                <form
                  action={editarInsumo}
                  id={`edit-${i.id}`}
                  className="contents"
                >
                  <input type="hidden" name="id" value={i.id} />
                  <Input name="nombre" defaultValue={i.nombre} />
                  <Select name="categoria" defaultValue={i.categoria}>
                    {CATEGORIA_INSUMO_VALUES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORIA_INSUMO_LABEL[c]}
                      </option>
                    ))}
                  </Select>
                  <Input name="unidad" defaultValue={i.unidad} />
                  <Button type="submit" variant="secondary" size="sm">
                    <Save className="h-4 w-4" /> Guardar
                  </Button>
                </form>
                <form action={eliminarInsumo}>
                  <input type="hidden" name="id" value={i.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
