import { createClient } from "@/lib/supabase/server";
import { MessageSquare, CheckCircle2, Phone, AlertCircle, HelpCircle, Trash2, PackagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { marcarMensajeResuelto } from "@/app/actions";

export const dynamic = "force-dynamic";

const TIPO_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  error:                { label: "Error",            color: "text-red-400 bg-red-500/10 border-red-500/30",     Icon: AlertCircle },
  dato_incorrecto:      { label: "Dato incorrecto",  color: "text-amber-400 bg-amber-500/10 border-amber-500/30", Icon: AlertCircle },
  sugerencia_telefono:  { label: "Teléfono",         color: "text-blue-400 bg-blue-500/10 border-blue-500/30",  Icon: Phone },
  solicitud_centro:     { label: "Nuevo centro",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Icon: MessageSquare },
  solicitud_eliminacion:  { label: "Eliminar centro",  color: "text-red-400 bg-red-500/10 border-red-500/30",       Icon: Trash2 },
  solicitud_insumo_libre: { label: "Insumo libre",    color: "text-purple-400 bg-purple-500/10 border-purple-500/30", Icon: PackagePlus },
  otro:                   { label: "Otro",             color: "text-slate-400 bg-slate-500/10 border-slate-500/30",   Icon: HelpCircle },
};

interface Mensaje {
  id: string;
  tipo: string;
  mensaje: string;
  email: string | null;
  estado: string;
  created_at: string;
  centro: { nombre: string } | null;
}

export default async function AdminMensajesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("mensajes_admin")
    .select("id, tipo, mensaje, email, estado, created_at, centro:centros(nombre)")
    .order("created_at", { ascending: false });

  const mensajes = (data ?? []) as unknown as Mensaje[];
  const pendientes = mensajes.filter((m) => m.estado === "pendiente");
  const resueltos  = mensajes.filter((m) => m.estado === "resuelto");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Mensajes</h2>
        <p className="text-sm text-slate-500">
          {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
          {resueltos.length > 0 && ` · ${resueltos.length} resuelto${resueltos.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {pendientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No hay mensajes pendientes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendientes.map((m) => (
            <MensajeCard key={m.id} m={m} />
          ))}
        </div>
      )}

      {resueltos.length > 0 && (
        <details className="group rounded-xl border border-slate-800">
          <summary className="cursor-pointer px-4 py-3 text-sm text-slate-500 hover:text-slate-300 list-none flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Ver {resueltos.length} resuelto{resueltos.length !== 1 ? "s" : ""}
          </summary>
          <div className="space-y-3 border-t border-slate-800 p-4">
            {resueltos.map((m) => (
              <MensajeCard key={m.id} m={m} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function MensajeCard({ m }: { m: Mensaje }) {
  const cfg = TIPO_CONFIG[m.tipo] ?? TIPO_CONFIG.otro;
  const { Icon } = cfg;
  const fecha = new Date(m.created_at).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Caracas",
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-panel/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
          {m.centro && (
            <span className="text-xs text-slate-500">· {m.centro.nombre}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-slate-600">{fecha}</span>
      </div>

      <p className="text-sm text-slate-200 whitespace-pre-wrap">{m.mensaje}</p>

      {m.email && (
        <p className="text-xs text-slate-500">
          Contacto: <a href={`mailto:${m.email}`} className="text-marca hover:underline">{m.email}</a>
        </p>
      )}

      {m.estado === "pendiente" && (
        <form action={marcarMensajeResuelto}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/40 bg-emerald-700/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-700/30"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marcar como resuelto
          </button>
        </form>
      )}
    </div>
  );
}
