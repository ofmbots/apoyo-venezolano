"use client";

import { useActionState, useState } from "react";
import { Phone, ChevronDown, Send } from "lucide-react";
import { enviarReporte, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SugerenciaTelefonoForm({
  centroId,
  centroNombre,
}: {
  centroId: string;
  centroNombre: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    enviarReporte,
    null
  );

  if (state?.ok) {
    return (
      <p className="mt-4 text-xs text-emerald-400">
        ✓ Sugerencia enviada, el equipo la revisará pronto.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-marca"
      >
        <Phone className="h-3.5 w-3.5" />
        ¿Conoces el teléfono? Añadirlo
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            abierto && "rotate-180"
          )}
        />
      </button>

      {abierto && (
        <form action={formAction} className="mt-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 space-y-3">
          <input type="hidden" name="tipo" value="sugerencia_telefono" />
          <input type="hidden" name="centro_id" value={centroId} />
          <input
            type="hidden"
            name="mensaje"
            value={`Sugerencia de teléfono para: ${centroNombre}`}
          />

          <p className="text-xs text-slate-400">
            Introduce el número y un administrador lo verificará antes de publicarlo.
          </p>

          <div className="flex gap-2">
            <input
              type="tel"
              name="telefono_sugerido"
              required
              placeholder="+58 212 0000000"
              className="h-10 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
            />
            <Button type="submit" size="sm" disabled={pending}>
              <Send className="h-3.5 w-3.5" />
              {pending ? "…" : "Enviar"}
            </Button>
          </div>

          {state?.error && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
