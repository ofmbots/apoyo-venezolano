import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { rutaSegura } from "@/lib/navigation";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: nextRaw } = await searchParams;
  const next = rutaSegura(nextRaw);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Card className="w-full animate-fade-up">
        <CardHeader>
          <CardTitle>Registro de responsable</CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            Este registro es exclusivo para responsables de centros de apoyo. Tu solicitud será revisada por el administrador antes de activarse.
          </p>
        </CardHeader>
        <CardContent>
          <RegistroForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
