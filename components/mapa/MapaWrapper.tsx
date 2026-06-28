"use client";

import dynamic from "next/dynamic";
import type { Centro } from "@/lib/types";

// Leaflet usa `window`, asi que el mapa se carga solo en el navegador (ssr: false).
const MapaCentros = dynamic(() => import("./MapaCentros"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-slate-500">
      Cargando mapa…
    </div>
  ),
});

export function MapaWrapper({ centros }: { centros: Centro[] }) {
  return <MapaCentros centros={centros} />;
}
