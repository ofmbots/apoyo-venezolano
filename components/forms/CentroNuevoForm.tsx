"use client";

import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { Keyboard, Map } from "lucide-react";
import { crearCentro, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BuscadorDireccion } from "@/components/forms/BuscadorDireccion";
import { cn } from "@/lib/utils";

const MapaSelectorPicker = dynamic(() => import("@/components/mapa/MapaSelectorPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-500">
      Cargando mapa…
    </div>
  ),
});

type Modo = "coords" | "mapa";

export function CentroNuevoForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    crearCentro,
    null
  );
  const [modo, setModo] = useState<Modo>("coords");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tipo, setTipo] = useState("hospital");

  const sinUbicacion = lat === null || lng === null;

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-8 text-center space-y-2">
        <p className="font-semibold text-emerald-300">¡Solicitud enviada!</p>
        <p className="text-sm text-slate-400">
          Un administrador la revisará y, si es correcta, la publicará en el mapa.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre del centro</Label>
        <Input id="nombre" name="nombre" required placeholder="Hospital, refugio…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo">Tipo</Label>
        <Select
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="hospital">Hospital</option>
          <option value="centro_acopio">Centro de acopio</option>
          <option value="centro_medico">Centro médico</option>
          <option value="temporal">Punto temporal</option>
        </Select>
      </div>

      {tipo === "temporal" && (
        <div className="space-y-1.5">
          <Label htmlFor="fecha_hasta">Operativo hasta (fecha y hora aproximada)</Label>
          <Input
            id="fecha_hasta"
            name="fecha_hasta"
            type="datetime-local"
            required
            className="[color-scheme:dark]"
          />
          <p className="text-xs text-slate-500">
            Indica cuándo dejará de estar operativo este punto.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" placeholder="Ciudad, estado…" />
      </div>

      {/* Ubicación */}
      <div>
        <Label className="mb-2 block">Ubicación</Label>

        {/* Toggle modo */}
        <div className="mb-3 flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setModo("coords")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              modo === "coords"
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

        {modo === "coords" ? (
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
              Haz clic en el mapa para colocar el pin en la ubicación del centro.
            </p>
            {lat !== null ? (
              <p className="text-xs text-marca">
                📍 {lat.toFixed(5)}, {lng!.toFixed(5)} — listo
              </p>
            ) : (
              <p className="text-xs text-slate-500">Ningún punto seleccionado aún.</p>
            )}
          </div>
        )}

        {/* Campos ocultos que recibe el server action */}
        <input type="hidden" name="lat" value={lat ?? ""} />
        <input type="hidden" name="lng" value={lng ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefono_contacto">Teléfono de contacto</Label>
        <Input
          id="telefono_contacto"
          name="telefono_contacto"
          placeholder="+58 412 1234567"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending || sinUbicacion}>
        {pending ? "Enviando solicitud…" : "Registrar centro"}
      </Button>

      {sinUbicacion && (
        <p className="text-center text-xs text-slate-500">
          {modo === "coords"
            ? "Busca y selecciona una dirección para continuar."
            : "Marca un punto en el mapa para continuar."}
        </p>
      )}
    </form>
  );
}
