import Link from "next/link";
import { ClipboardCheck, Boxes, Building2, Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function contar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tabla: string,
  filtros?: (q: any) => any
) {
  let q = supabase.from(tabla).select("*", { count: "exact", head: true });
  if (filtros) q = filtros(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [pendientes, insumos, centrosActivos, centrosTotal, usuarios, responsables] =
    await Promise.all([
      contar(supabase, "solicitudes_insumos", (q) =>
        q.eq("estado_aprobacion", "pendiente")
      ),
      contar(supabase, "catalogo_insumos"),
      contar(supabase, "centros", (q) => q.eq("estado", "activo")),
      contar(supabase, "centros"),
      contar(supabase, "profiles"),
      contar(supabase, "profiles", (q) => q.eq("rol", "responsable")),
    ]);

  const cards = [
    {
      href: "/admin/solicitudes",
      label: "Solicitudes pendientes",
      valor: pendientes,
      sub: "esperando aprobación",
      Icon: ClipboardCheck,
      color: "text-amber-400",
      destacado: pendientes > 0,
    },
    {
      href: "/admin/insumos",
      label: "Insumos en catálogo",
      valor: insumos,
      sub: "tipos disponibles",
      Icon: Boxes,
      color: "text-blue-400",
    },
    {
      href: "/admin/centros",
      label: "Centros",
      valor: centrosActivos,
      sub: `${centrosTotal} en total`,
      Icon: Building2,
      color: "text-emerald-400",
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      valor: usuarios,
      sub: `${responsables} responsables`,
      Icon: Users,
      color: "text-violet-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ href, label, valor, sub, Icon, color, destacado }) => (
        <Link
          key={href}
          href={href}
          className={`group rounded-2xl border bg-panel/70 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-700 ${
            destacado ? "border-amber-500/40" : "border-slate-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <Icon className={`h-6 w-6 ${color}`} />
            <ArrowRight className="h-4 w-4 -translate-x-1 text-slate-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-50">{valor}</p>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </Link>
      ))}
    </div>
  );
}
