import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { rutaSegura } from "@/lib/navigation";

const AVISO_NEXT: Record<string, string> = {
  "/donar": "Inicia sesión para continuar con tu donación.",
  "/solicitar": "Inicia sesión para registrar una necesidad.",
  "/centros/nuevo": "Inicia sesión para registrar un centro.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: nextRaw } = await searchParams;
  const next = rutaSegura(nextRaw);
  const aviso = AVISO_NEXT[next.split("?")[0]];

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Card className="w-full animate-fade-up">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          {aviso && <p className="mt-1 text-sm text-marca">{aviso}</p>}
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
