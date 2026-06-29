"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { LocateFixed, Phone, Search, MapPin, Keyboard, Map } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BuscadorDireccion } from "@/components/forms/BuscadorDireccion";
import { cn } from "@/lib/utils";
import {
  TIPO_CENTRO_COLOR,
  TIPO_CENTRO_LABEL,
  CATEGORIA_INSUMO_LABEL,
  CATEGORIA_INSUMO_VALUES,
  type CatalogoInsumo,
  type CategoriaInsumo,
  type TipoCentro,
} from "@/lib/types";

const MapaSelectorPicker = dynamic(() => import("@/components/mapa/MapaSelectorPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-500">
      Cargando mapa…
    </div>
  ),
});

type Modo = "buscador" | "mapa";

interface Resultado {
  centro_id: string;
  nombre: string;
  tipo: TipoCentro;
  direccion: string | null;
  telefono_contacto: string | null;
  distancia_km: number;
  cantidad_necesaria?: number;
  prioridad?: "urgente" | "normal";
}

export function DonarFlow({
  insumos,
}: {
  insumos: Pick<CatalogoInsumo, "id" | "nombre" | "unidad" | "categoria">[];
}) {
  const supabase = createClient();
  const [modo, setModo] = useState<Modo>("buscador");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [categoria, setCategoria] = useState<CategoriaInsumo | "">("");
  const [insumoId, setInsumoId] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [esFallback, setEsFallback] = useState(false);

  const insumosFiltrados = categoria
    ? insumos.filter((i) => i.categoria === categoria)
    : [];

  function handleCategoriaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoria(e.target.value as CategoriaInsumo);
    setInsumoId("");
    setResultados(null);
  }

  async function buscar() {
    setError(null);
    if (lat === null || lng === null) {
      setError("Indica tu ubicación usando el buscador o el mapa.");
      return;
    }
    if (!insumoId) {
      setError("Elige qué quieres donar.");
      return;
    }

    setBuscando(true);
    setResultados(null);

    const { data, error: rpcError } = await supabase.rpc("buscar_centros_con_insumo", {
      insumo_buscado: insumoId,
      lat_donante: lat,
      lng_donante: lng,
    });

    if (rpcError) {
      setError("Error al buscar: " + rpcError.message);
      setBuscando(false);
      return;
    }

    if (data && data.length > 0) {
      setResultados(data as Resultado[]);
      setEsFallback(false);
    } else {
      const { data: cercanos } = await supabase.rpc("centros_mas_cercanos", {
        lat_donante: lat,
        lng_donante: lng,
        limite: 5,
      });
      setResultados((cercanos ?? []) as Resultado[]);
      setEsFallback(true);
    }
    setBuscando(false);
  }

  const insumoNombre = insumos.find((i) => i.id === insumoId)?.nombre;
  const sinUbicacion = lat === null || lng === null;

  return (
    <div className="space-y-5">
      {/* Paso 1: ubicación */}
      <div>
        <Label className="mb-2 block">1. ¿Dónde estás?</Label>

        <div className="mb-3 flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setModo("buscador")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              modo === "buscador"
                ? "bg-slate-700 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Keyboard className="h-3.5 w-3.5" /> Buscar dirección
          </button>
          <button
            type="button"
            onClick={() => setModo("mapa")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              modo === "mapa"
                ? "bg-slate-700 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Map className="h-3.5 w-3.5" /> Marcar en mapa
          </button>
        </div>

        {modo === "buscador" ? (
          <BuscadorDireccion
            onSelect={(lt, lg) => { setLat(lt); setLng(lg); }}
          />
        ) : (
          <div className="space-y-1.5">
            <div className="h-56 overflow-hidden rounded-xl border border-slate-700">
              <MapaSelectorPicker
                lat={lat}
                lng={lng}
                onSelect={(lt, lg) => { setLat(lt); setLng(lg); }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Haz clic en el mapa para marcar tu ubicación.
            </p>
          </div>
        )}

        {lat !== null && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-marca">
            <LocateFixed className="h-3.5 w-3.5" />
            Ubicación seleccionada ({lat.toFixed(4)}, {lng!.toFixed(4)})
          </p>
        )}
      </div>

      {/* Paso 2: categoría */}
      <div className="space-y-1.5">
        <Label htmlFor="categoria">2. ¿Qué categoría quieres donar?</Label>
        <Select
          id="categoria"
          value={categoria}
          onChange={handleCategoriaChange}
        >
          <option value="" disabled>Elige una categoría…</option>
          {CATEGORIA_INSUMO_VALUES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_INSUMO_LABEL[cat]}
            </option>
          ))}
        </Select>
      </div>

      {/* Paso 3: insumo filtrado */}
      {categoria && (
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="insumo">3. ¿Qué producto concreto?</Label>
            <span className="text-xs text-slate-500">{insumosFiltrados.length} disponibles</span>
          </div>
          <Select
            id="insumo"
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
          >
            <option value="" disabled>Elige un insumo…</option>
            {insumosFiltrados.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </Select>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        onClick={buscar}
        className="w-full"
        size="lg"
        disabled={buscando || sinUbicacion || !insumoId}
      >
        <Search className="h-4 w-4" />
        {buscando ? "Buscando…" : "Buscar centro más cercano"}
      </Button>

      {/* Resultados */}
      {resultados && (
        <div className="space-y-3 pt-2">
          {resultados.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
              No hay centros activos cerca para mostrar.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                {esFallback ? (
                  <>
                    Ningún centro registró necesidad de{" "}
                    <strong className="text-slate-200">{insumoNombre}</strong>. Estos son
                    los centros activos más cercanos:
                  </>
                ) : (
                  <>
                    Centros que necesitan{" "}
                    <strong className="text-marca">{insumoNombre}</strong>, del más
                    cercano al más lejano:
                  </>
                )}
              </p>
              {resultados.map((r, idx) => (
                <ResultadoCard key={r.centro_id} r={r} destacado={!esFallback && idx === 0} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultadoCard({ r, destacado }: { r: Resultado; destacado: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        destacado ? "border-marca/40 bg-marca/5 shadow-glow" : "border-slate-800 bg-panel/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TIPO_CENTRO_COLOR[r.tipo] }}
            />
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {TIPO_CENTRO_LABEL[r.tipo]}
            </span>
            {destacado && (
              <span className="rounded-full bg-marca/20 px-2 py-0.5 text-[10px] font-bold uppercase text-marca">
                Más cercano
              </span>
            )}
          </div>
          <p className="mt-1 font-semibold text-slate-100">{r.nombre}</p>
          {r.direccion && (
            <p className="flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> {r.direccion}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1 text-sm font-semibold text-slate-200">
          {r.distancia_km.toFixed(1)} km
        </span>
      </div>

      {typeof r.cantidad_necesaria === "number" && (
        <p className="mt-2 text-sm text-slate-300">
          Necesita: <strong>{r.cantidad_necesaria}</strong>
          {r.prioridad === "urgente" && (
            <span className="ml-2 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
              Urgente
            </span>
          )}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {r.telefono_contacto && (
          <a href={`tel:${r.telefono_contacto}`}>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" /> Llamar
            </Button>
          </a>
        )}
        <Link href={`/centros/${r.centro_id}`}>
          <Button variant="ghost" size="sm">Ver detalle</Button>
        </Link>
      </div>
    </div>
  );
}
