import Link from "next/link";
import { MapPin, Boxes, Building2, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CentrosExplorer } from "@/components/CentrosExplorer";
import { AccionesHome } from "@/components/AccionesHome";
import { Button } from "@/components/ui/button";
import type { Centro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: centros }, { count: nInsumos }] = await Promise.all([
    supabase.from("centros").select("*").eq("estado", "activo").order("nombre"),
    supabase.from("catalogo_insumos").select("*", { count: "exact", head: true }),
  ]);

  const lista = (centros ?? []) as Centro[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <section className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-marca/30 bg-marca/10 px-3 py-1 text-xs font-medium text-marca">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-marca" />
          Ayuda humanitaria · Venezuela
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-5xl">
          Conecta lo que quieres donar con quien{" "}
          <span className="text-marca">de verdad lo necesita</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          Encuentra el centro más cercano que necesita justo lo que puedes aportar:
          agua, medicinas, alimentos, ropa y más.
        </p>

        <div className="mt-6">
          <Link href="/donar">
            <Button size="lg" variant="default">
              <HeartHandshake className="h-5 w-5" /> Quiero donar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-marca" />
            <strong className="text-slate-200">{lista.length}</strong> centros activos
          </span>
          <span className="inline-flex items-center gap-2">
            <Boxes className="h-4 w-4 text-blue-400" />
            <strong className="text-slate-200">{nInsumos ?? 0}</strong> tipos de insumo
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Cobertura nacional
          </span>
        </div>
      </section>

      {/* Acciones */}
      <section className="mt-10 animate-fade-up">
        <AccionesHome />
      </section>

      {/* Mapa + listado */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-100">Centros en el mapa</h2>
        <p className="mt-1 mb-5 text-sm text-slate-400">
          Filtra por tipo y toca un pin o una tarjeta para ver qué necesita cada centro.
        </p>

        {lista.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            Todavía no hay centros activos.
          </p>
        ) : (
          <CentrosExplorer centros={lista} />
        )}
      </section>
    </div>
  );
}
