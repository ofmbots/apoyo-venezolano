import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CentroNuevoForm } from "@/components/forms/CentroNuevoForm";

export const dynamic = "force-dynamic";

export default async function CentroNuevoPage() {
  const { profile } = await requireUser("/centros/nuevo");
  const esAdmin = profile?.rol === "admin";

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
          <CardTitle>Registrar centro</CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            Añade un hospital, centro de acopio, centro médico o punto temporal al mapa.
          </p>
        </CardHeader>
        <CardContent>
          {!esAdmin && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Tu solicitud se enviará para revisión. En cuanto un administrador
                la apruebe, el centro aparecerá en el mapa y estará disponible
                para recibir donaciones.
              </span>
            </div>
          )}
          <CentroNuevoForm />
        </CardContent>
      </Card>
    </div>
  );
}
