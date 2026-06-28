import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protege TODO /admin/*
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-marca/15 text-marca">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-100 sm:text-lg">Panel de administración</h1>
            <p className="text-xs text-slate-500">Gestión de la plataforma</p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Ir al sitio
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
