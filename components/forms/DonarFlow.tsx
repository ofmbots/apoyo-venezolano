"use client";

import { useState } from "react";
import Link from "next/link";
import { LocateFixed, Phone, Search, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  TIPO_CENTRO_COLOR,
  TIPO_CENTRO_LABEL,
  type CatalogoInsumo,
  type TipoCentro,
} from "@/lib/types";

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
  insumos: Pick<CatalogoInsumo, "id" | "nombre" | "unidad">[];
}) {
  const supabase = createClient();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [insumoId, setInsumoId] = useState("");
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [esFallback, setEsFallback] = useState(false);

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setGeoMsg("Tu navegador no permite geolocalización.");
      return;
    }
    setGeoMsg("Obteniendo ubicación…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoMsg("Ubicación cargada ✓");
      },
      () => setGeoMsg("No se pudo obtener tu ubicación. Escríbela a mano."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function buscar() {
    setError(null);
    const latN = Number(lat);
    const lngN = Number(lng);
    if (Number.isNaN(latN) || Number.isNaN(lngN) || !lat || !lng) {
      setError("Indica tu ubicación (usa el botón o escribe lat/lng).");
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
      lat_donante: latN,
      lng_donante: lngN,
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
      // Fallback: nadie necesita ese insumo -> centros activos más cercanos
      const { data: cercanos } = await supabase.rpc("centros_mas_cercanos", {
        lat_donante: latN,
        lng_donante: lngN,
        limite: 5,
      });
      setResultados((cercanos ?? []) as Resultado[]);
      setEsFallback(true);
    }
    setBuscando(false);
  }

  const insumoNombre = insumos.find((i) => i.id === insumoId)?.nombre;

  return (
    <div className="space-y-6">
      {/* Paso 1: ubicación */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>1. ¿Dónde estás?</Label>
          <Button type="button" variant="secondary" size="sm" onClick={usarUbicacion}>
            <LocateFixed className="h-4 w-4" /> Usar mi ubicación
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            type="number"
            step="any"
            placeholder="Latitud"
          />
          <Input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            type="number"
            step="any"
            placeholder="Longitud"
          />
        </div>
        {geoMsg && <p className="mt-1.5 text-xs text-slate-400">{geoMsg}</p>}
      </div>

      {/* Paso 2: insumo */}
      <div className="space-y-1.5">
        <Label htmlFor="insumo">2. ¿Qué quieres donar?</Label>
        <Select
          id="insumo"
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
        >
          <option value="" disabled>
            Elige un insumo…
          </option>
          {insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button onClick={buscar} className="w-full" size="lg" disabled={buscando}>
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
                    los centros activos más cercanos por si quieres acercarte igual:
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
        destacado
          ? "border-marca/40 bg-marca/5 shadow-glow"
          : "border-slate-800 bg-panel/60"
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
          <>
            <a href={`tel:${r.telefono_contacto}`}>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" /> Llamar
              </Button>
            </a>
          </>
        )}
        <Link href={`/centros/${r.centro_id}`}>
          <Button variant="ghost" size="sm">
            Ver detalle
          </Button>
        </Link>
      </div>
    </div>
  );
}
