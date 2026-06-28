import Link from "next/link";
import { HeartHandshake, Building2, ClipboardList, ArrowRight } from "lucide-react";

const acciones = [
  {
    href: "/donar",
    titulo: "Donar",
    desc: "Dinos qué tienes y dónde estás. Te mostramos el centro más cercano que lo necesita.",
    Icon: HeartHandshake,
    iconClass: "bg-marca text-slate-950 border-transparent shadow-lg shadow-marca/30",
  },
  {
    href: "/solicitar",
    titulo: "Registrar necesidad",
    desc: "¿Un centro necesita algo? Regístralo para que los donantes lo vean.",
    Icon: ClipboardList,
    iconClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    href: "/centros/nuevo",
    titulo: "Registrar centro",
    desc: "Añade un hospital, refugio o punto de acopio al mapa.",
    Icon: Building2,
    iconClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
];

export function AccionesHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {acciones.map(({ href, titulo, desc, Icon, iconClass }) => (
        <Link
          key={href}
          href={href}
          className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-panel/70 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl hover:shadow-black/40"
        >
          <div
            className={`mb-3 inline-grid h-11 w-11 place-items-center rounded-xl border ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="flex items-center gap-1 text-base font-semibold text-slate-100">
            {titulo}
            <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{desc}</p>
        </Link>
      ))}
    </div>
  );
}
