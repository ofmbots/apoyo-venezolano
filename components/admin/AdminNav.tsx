"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Boxes,
  Building2,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Resumen", Icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", Icon: ClipboardCheck },
  { href: "/admin/insumos", label: "Insumos", Icon: Boxes },
  { href: "/admin/centros", label: "Centros", Icon: Building2 },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users },
  { href: "/admin/mensajes", label: "Mensajes", Icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-1">
      {items.map(({ href, label, Icon, exact }) => {
        const activo = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-marca/15 text-marca"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
