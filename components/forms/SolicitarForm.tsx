"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { crearSolicitud, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  CATEGORIA_INSUMO_LABEL,
  CATEGORIA_INSUMO_VALUES,
  type CatalogoInsumo,
  type CategoriaInsumo,
  type Centro,
} from "@/lib/types";

export function SolicitarForm({
  centros,
  insumos,
  centroPre,
}: {
  centros: Pick<Centro, "id" | "nombre">[];
  insumos: Pick<CatalogoInsumo, "id" | "nombre" | "unidad" | "categoria">[];
  centroPre?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    crearSolicitud,
    null
  );
  const [centroId, setCentroId] = useState(centroPre ?? "");
  const [categoriaKey, setCategoriaKey] = useState<CategoriaInsumo | "__libre__" | "">("");
  const [categoriaLibre, setCategoriaLibre] = useState("");
  const [insumoId, setInsumoId] = useState("");
  const [insumoLibre, setInsumoLibre] = useState("");

  function handleCentroChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__nuevo__") {
      router.push("/centros/nuevo");
      return;
    }
    setCentroId(val);
  }

  function handleCategoriaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoriaKey(e.target.value as CategoriaInsumo | "__libre__");
    setCategoriaLibre("");
    setInsumoId("");
    setInsumoLibre("");
  }

  function handleInsumoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setInsumoId(e.target.value);
    setInsumoLibre("");
  }

  const esLibreCategoria = categoriaKey === "__libre__";
  const esLibreInsumo = insumoId === "__libre__";

  const insumosFiltrados =
    categoriaKey && !esLibreCategoria
      ? insumos.filter((i) => i.categoria === (categoriaKey as CategoriaInsumo))
      : [];

  const puedeSometer =
    !!centroId &&
    ((esLibreCategoria && categoriaLibre.trim().length > 0) ||
      (esLibreInsumo && insumoLibre.trim().length > 0) ||
      (!!insumoId && !esLibreInsumo));

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-emerald-700/40 bg-emerald-700/10 p-6 text-center space-y-2">
        <p className="text-emerald-400 font-medium">✓ Solicitud enviada</p>
        <p className="text-sm text-slate-400">
          El equipo la revisará y la añadirá al sistema.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Centro */}
      <div className="space-y-1.5">
        <Label htmlFor="centro_id">Centro</Label>
        <Select
          id="centro_id"
          name="centro_id"
          value={centroId}
          onChange={handleCentroChange}
          required
        >
          <option value="" disabled>Elige un centro…</option>
          {centros.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
          <option value="__nuevo__">＋ Registrar nuevo centro</option>
        </Select>
      </div>

      {/* Paso 1: Categoría */}
      <div className="space-y-1.5">
        <Label htmlFor="categoria_key">Categoría</Label>
        <Select
          id="categoria_key"
          value={categoriaKey}
          onChange={handleCategoriaChange}
        >
          <option value="" disabled>Elige una categoría…</option>
          {CATEGORIA_INSUMO_VALUES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_INSUMO_LABEL[cat]}
            </option>
          ))}
          <option value="__libre__">Otra categoría (especificar)</option>
        </Select>
      </div>

      {/* Categoría libre */}
      {esLibreCategoria && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="categoria_libre">¿Qué tipo de producto necesitas?</Label>
            <Input
              id="categoria_libre"
              name="categoria_libre"
              placeholder="Ej: Equipos de buceo, Drones industriales…"
              value={categoriaLibre}
              onChange={(e) => setCategoriaLibre(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-500">
            El equipo revisará la solicitud y la añadirá al catálogo si aplica.
          </p>
        </>
      )}

      {/* Paso 2: Insumo filtrado (solo si hay categoría concreta) */}
      {categoriaKey && !esLibreCategoria && (
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="insumo_id">Insumo que necesita</Label>
            <span className="text-xs text-slate-500">
              {insumosFiltrados.length} disponibles
            </span>
          </div>
          <Select
            id="insumo_id"
            name="insumo_id"
            value={insumoId}
            onChange={handleInsumoChange}
          >
            <option value="" disabled>Elige un insumo…</option>
            {insumosFiltrados.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre} ({i.unidad})
              </option>
            ))}
            <option value="__libre__">No está en la lista (especificar)</option>
          </Select>
        </div>
      )}

      {/* Insumo libre */}
      {esLibreInsumo && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="insumo_libre">¿Qué insumo necesitas?</Label>
            <Input
              id="insumo_libre"
              name="insumo_libre"
              placeholder="Describe el insumo que necesitas…"
              value={insumoLibre}
              onChange={(e) => setInsumoLibre(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-500">
            El equipo revisará la solicitud y la añadirá al catálogo si aplica.
          </p>
        </>
      )}

      {/* Cantidad: solo cuando hay insumo concreto del catálogo */}
      {insumoId && !esLibreInsumo && (
        <div className="space-y-1.5">
          <Label htmlFor="cantidad_necesaria">Cantidad</Label>
          <Input
            id="cantidad_necesaria"
            name="cantidad_necesaria"
            type="number"
            min={1}
            step="any"
            required
          />
        </div>
      )}

      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      {!esLibreCategoria && !esLibreInsumo && insumoId && (
        <p className="text-xs text-slate-500">
          Tu solicitud queda{" "}
          <strong className="text-slate-400">pendiente</strong> hasta que el
          responsable del centro o un administrador la apruebe.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !puedeSometer}
      >
        {pending ? "Enviando…" : "Registrar necesidad"}
      </Button>
    </form>
  );
}
