"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registro } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegistroForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(registro, null);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  if (state?.mensaje) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
        {state.mensaje}
      </p>
    );
  }

  return (
    <>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1.5">
          <Label htmlFor="nombre_completo">Nombre completo</Label>
          <Input id="nombre_completo" name="nombre_completo" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cedula">Cédula</Label>
          <Input id="cedula" name="cedula" required placeholder="V-12345678" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefono_whatsapp">WhatsApp</Label>
          <Input
            id="telefono_whatsapp"
            name="telefono_whatsapp"
            required
            placeholder="+58 412 1234567"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href={loginHref} className="font-medium text-marca hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
