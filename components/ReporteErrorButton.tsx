"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X, Send } from "lucide-react";
import { enviarReporte, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function ReporteErrorButton() {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    enviarReporte,
    null
  );

  useEffect(() => { setMontado(true); }, []);

  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(() => setAbierto(false), 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const modal = abierto && (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setAbierto(false); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-panel shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-slate-100">Informar de un error</h2>
          </div>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="rounded-lg p-1 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Tipo</label>
            <select
              name="tipo"
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
            >
              <option value="error">Error en la plataforma</option>
              <option value="dato_incorrecto">Dato incorrecto (hospital, dirección…)</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Descripción</label>
            <textarea
              name="mensaje"
              required
              rows={4}
              placeholder="Describe el error con el mayor detalle posible…"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Tu email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Para que podamos responderte"
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-marca/60 focus:outline-none focus:ring-2 focus:ring-marca/25"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              ¡Reporte enviado! Gracias por ayudarnos a mejorar.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending || !!state?.ok}>
            <Send className="h-4 w-4" />
            {pending ? "Enviando…" : "Enviar reporte"}
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/50 px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200 sm:px-3"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Informar error</span>
      </button>

      {montado && createPortal(modal, document.body)}
    </>
  );
}
