import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TIPO_CENTRO_COLOR, TIPO_CENTRO_LABEL, type Centro } from "@/lib/types";

export function CentroCard({ centro }: { centro: Centro }) {
  return (
    <Link
      href={`/centros/${centro.id}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-800 bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:bg-panel"
    >
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-white/5"
        style={{ backgroundColor: TIPO_CENTRO_COLOR[centro.tipo] }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-100">{centro.nombre}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {TIPO_CENTRO_LABEL[centro.tipo]}
        </p>
        {centro.direccion && (
          <p className="mt-1 truncate text-sm text-slate-400">{centro.direccion}</p>
        )}
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
    </Link>
  );
}
