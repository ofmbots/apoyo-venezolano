"use client";

import { useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";

interface Lugar {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function BuscadorDireccion({
  onSelect,
}: {
  onSelect: (lat: number, lng: number, nombre: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [confirmado, setConfirmado] = useState<string | null>(null);
  const [foco, setFoco] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setConfirmado(null);
    if (timer.current) clearTimeout(timer.current);
    if (val.trim().length < 3) { setLugares([]); return; }

    timer.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const url =
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ve` +
          `&q=${encodeURIComponent(val)}&limit=6&accept-language=es`;
        const res = await fetch(url, { headers: { "Accept-Language": "es" } });
        setLugares(await res.json());
      } catch {
        setLugares([]);
      } finally {
        setBuscando(false);
      }
    }, 420);
  }

  function elegir(l: Lugar) {
    const nombre = l.display_name.split(",").slice(0, 3).join(",").trim();
    setQuery(nombre);
    setConfirmado(nombre);
    setLugares([]);
    onSelect(Number(l.lat), Number(l.lon), nombre);
  }

  function limpiar() {
    setQuery("");
    setLugares([]);
    setConfirmado(null);
  }

  const mostrarLista = foco && (buscando || lugares.length > 0) && !confirmado;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setFoco(true)}
          onBlur={() => setTimeout(() => setFoco(false), 180)}
          placeholder="Escribe la calle, ciudad o punto de referencia…"
          className="h-11 w-full rounded-xl border border-slate-700 bg-panel/70 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={limpiar}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {mostrarLista && (
          <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-700 bg-panel shadow-2xl shadow-black/60">
            {buscando ? (
              <li className="px-4 py-3 text-sm text-slate-400">Buscando…</li>
            ) : (
              lugares.map((l) => (
                <li key={l.place_id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); elegir(l); }}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-800"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-marca" />
                    <span className="text-sm leading-snug text-slate-200">
                      {l.display_name}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {confirmado && (
        <p className="flex items-center gap-1.5 text-xs text-marca">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {confirmado}
        </p>
      )}
    </div>
  );
}
