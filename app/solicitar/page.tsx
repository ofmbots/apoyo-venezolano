import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolicitarForm } from "@/components/forms/SolicitarForm";
import type { CatalogoInsumo, Centro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string }>;
}) {
  const { centro } = await searchParams;
  const nextPath = "/solicitar" + (centro ? `?centro=${centro}` : "");
  const { supabase } = await requireUser(nextPath);

  const [{ data: centros }, { data: insumos }] = await Promise.all([
    supabase.from("centros").select("id, nombre").eq("estado", "activo").order("nombre"),
    supabase.from("catalogo_insumos").select("id, nombre, unidad, categoria").order("nombre"),
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>Registrar necesidad</CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            Indica qué insumo necesita un centro y en qué cantidad.
          </p>
        </CardHeader>
        <CardContent>
          <SolicitarForm
            centros={(centros ?? []) as Pick<Centro, "id" | "nombre">[]}
            insumos={(insumos ?? []) as Pick<CatalogoInsumo, "id" | "nombre" | "unidad" | "categoria">[]}
            centroPre={centro}
          />
        </CardContent>
      </Card>
    </div>
  );
}
