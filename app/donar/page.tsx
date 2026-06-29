import Link from "next/link";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonarFlow } from "@/components/forms/DonarFlow";
import type { CatalogoInsumo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DonarPage() {
  const supabase = await createClient();

  const { data: insumos } = await supabase
    .from("catalogo_insumos")
    .select("id, nombre, unidad, categoria")
    .order("nombre");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-marca" /> Quiero donar
          </CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            Dinos dónde estás y qué tienes. Te mostramos el centro más cercano que lo
            necesita.
          </p>
        </CardHeader>
        <CardContent>
          <DonarFlow
            insumos={(insumos ?? []) as Pick<CatalogoInsumo, "id" | "nombre" | "unidad" | "categoria">[]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
