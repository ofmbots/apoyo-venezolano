"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin } from "lucide-react";
import { MapaWrapper } from "@/components/mapa/MapaWrapper";
import { CentroCard } from "@/components/CentroCard";
import { cn } from "@/lib/utils";
import {
  TIPO_CENTRO_COLOR,
  TIPO_CENTRO_LABEL,
  type Centro,
  type TipoCentro,
} from "@/lib/types";

type Filtro = TipoCentro | "todos";

const ORDEN_TIPOS: TipoCentro[] = ["hospital", "centro_acopio", "centro_medico", "temporal"];

// Normaliza: minúsculas y sin acentos, para que "cara" encuentre "Caracas".
// Nota: [̀-ͯ] es equivalente a \p{Diacritic} pero funciona en iOS Safari antiguo.
function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function CentrosExplorer({ centros }: { centros: Centro[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [q, setQ] = useState("");
  const [foco, setFoco] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const conteos = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of centros) m[c.tipo] = (m[c.tipo] ?? 0) + 1;
    return m;
  }, [centros]);

  const tiposDisponibles = ORDEN_TIPOS;
  const qn = normalizar(q.trim());

  // Filtro combinado: tipo (chip) + texto de búsqueda (nombre o dirección)
  const filtrados = useMemo(() => {
    return centros.filter((c) => {
      const okTipo = filtro === "todos" || c.tipo === filtro;
      if (!okTipo) return false;
      if (!qn) return true;
      const texto = normalizar(`${c.nombre} ${c.direccion ?? ""}`);
      return texto.includes(qn);
    });
  }, [centros, filtro, qn]);

  // Sugerencias para el autocompletado (independientes del chip activo)
  const sugerencias = useMemo(() => {
    if (qn.length < 2) return [];
    const matches = centros.filter((c) =>
      normalizar(`${c.nombre} ${c.direccion ?? ""}`).includes(qn)
    );
    // Prioriza los que empiezan por el término
    matches.sort((a, b) => {
      const aStarts = normalizar(a.nombre).startsWith(qn) ? 0 : 1;
      const bStarts = normalizar(b.nombre).startsWith(qn) ? 0 : 1;
      return aStarts - bStarts;
    });
    return matches.slice(0, 6);
  }, [centros, qn]);

  const mostrarSugerencias = foco && sugerencias.length > 0;

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-4 max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFoco(true)}
          onBlur={() => setTimeout(() => setFoco(false), 150)}
          placeholder="Buscar centro o ciudad… (ej: Cara → Caracas)"
          className="h-11 w-full rounded-xl border border-slate-700 bg-panel/70 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-300"
            aria-label="Limpiar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown de sugerencias */}
        {mostrarSugerencias && (
          <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-700 bg-panel shadow-2xl shadow-black/50">
            {sugerencias.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    router.push(`/centros/${c.id}`);
                  }}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-800"
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: TIPO_CENTRO_COLOR[c.tipo] }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-100">
                      {resaltar(c.nombre, qn)}
                    </span>
                    {c.direccion && (
                      <span className="flex items-center gap-1 truncate text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {c.direccion}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chips de filtro */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FiltroChip
          activo={filtro === "todos"}
          onClick={() => setFiltro("todos")}
          label="Todos"
          count={centros.length}
        />
        {tiposDisponibles.map((t) => (
          <FiltroChip
            key={t}
            activo={filtro === t}
            onClick={() => setFiltro(t)}
            label={TIPO_CENTRO_LABEL[t]}
            count={conteos[t] ?? 0}
            color={TIPO_CENTRO_COLOR[t]}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="order-2 max-h-[400px] space-y-3 overflow-y-auto pr-1 lg:order-1 lg:max-h-[68vh]">
          {filtrados.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              {qn ? "Ningún centro coincide con tu búsqueda." : "No hay ubicaciones de este tipo disponibles aún."}
            </p>
          ) : (
            filtrados.map((c) => <CentroCard key={c.id} centro={c} />)
          )}
        </div>

        <div className="order-1 h-[55vh] overflow-hidden rounded-2xl border border-slate-800 shadow-xl shadow-black/30 lg:order-2 lg:h-[68vh]">
          <MapaWrapper centros={filtrados} />
        </div>
      </div>
    </div>
  );
}

// Resalta en amarillo la parte del texto que coincide con la búsqueda
function resaltar(texto: string, qn: string) {
  if (!qn) return texto;
  const idx = normalizar(texto).indexOf(qn);
  if (idx === -1) return texto;
  return (
    <>
      {texto.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-marca">
        {texto.slice(idx, idx + qn.length)}
      </mark>
      {texto.slice(idx + qn.length)}
    </>
  );
}

function FiltroChip({
  activo,
  onClick,
  label,
  count,
  color,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        activo
          ? "border-marca/50 bg-marca/15 text-marca"
          : "border-slate-800 bg-panel/60 text-slate-300 hover:border-slate-700 hover:bg-panel"
      )}
    >
      {color && (
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-xs",
          activo ? "bg-marca/20 text-marca" : "bg-slate-800 text-slate-400"
        )}
      >
        {count}
      </span>
    </button>
  );
}
