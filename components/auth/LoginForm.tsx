"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, null);
  const registroHref = next === "/" ? "/registro" : `/registro?next=${encodeURIComponent(next)}`;

  return (
    <>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            required
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        ¿No tienes cuenta?{" "}
        <Link href={registroHref} className="font-medium text-marca hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
