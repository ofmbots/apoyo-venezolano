"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Trash2, ChevronDown, Send } from "lucide-react";
import { solicitarEliminacion, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SolicitarEliminacionForm({
  centroId,
  centroNombre,
}: {
  centroId: string;
  centroNombre: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    solicitarEliminacion,
    null
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === "#eliminar") {
      setAbierto(true);
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-slate-800 p-4 text-center">
        <p className="text-sm text-slate-400">
          ✓ Solicitud enviada. El equipo la revisará próximamente.
        </p>
      </div>
    );
  }

  return (
    <div id="eliminar" ref={ref} className="rounded-xl border border-slate-800 bg-panel/40">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
          Solicitar eliminación del centro
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-600 transition-transform duration-200",
            abierto && "rotate-180"
          )}
        />
      </button>

      {abierto && (
        <form action={formAction} className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-3">
          <input type="hidden" name="centro_id" value={centroId} />

          <p className="text-xs text-slate-500">
            Indica el motivo por el que este centro debería eliminarse del mapa
            (cerrado, duplicado, información incorrecta, etc.).
          </p>

          <textarea
            name="motivo"
            rows={3}
            placeholder={`Motivo para eliminar "${centroNombre}"…`}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
          />

          {state?.error && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}

          <Button
            type="submit"
            variant="destructive"
            size="sm"
            className="w-full"
            disabled={pending}
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Enviando…" : "Enviar solicitud"}
          </Button>
        </form>
      )}
    </div>
  );
}
