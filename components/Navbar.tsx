import Link from "next/link";
import { Heart, HeartHandshake, Settings, ExternalLink, UserSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import { ReporteErrorButton } from "@/components/ReporteErrorButton";
import type { Profile } from "@/lib/types";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Pick<Profile, "nombre_completo" | "rol"> | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("nombre_completo, rol")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-fondo/70 backdrop-blur-xl">
      <div className="h-0.5 w-full bg-marca/60" />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-100">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-marca text-slate-950 shadow-lg shadow-marca/30">
            <Heart className="h-5 w-5 drop-shadow" fill="currentColor" />
          </span>
          <span className="text-base">
            APOYO <span className="text-marca">VENEZOLANO</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ReporteErrorButton />
          <Link href="/donar" className="hidden sm:block">
            <Button size="sm" variant="default">
              <HeartHandshake className="h-4 w-4" /> Donar
            </Button>
          </Link>

          {user ? (
            <>
              {profile?.rol === "admin" && (
                <Link href="/admin" title="Panel de administración">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              {profile?.rol === "responsable" && (
                <span className="hidden rounded-full border border-marca/30 bg-marca/10 px-2.5 py-1 text-xs font-medium text-marca md:inline">
                  responsable
                </span>
              )}
              <span className="hidden max-w-[140px] truncate text-sm text-slate-400 md:inline">
                {profile?.nombre_completo ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/registro">
                <Button variant="outline" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sub-barra: plataformas de desaparecidos */}
      <div className="border-t border-slate-800/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 px-4 py-2 sm:justify-end">
          <span className="hidden cursor-default select-none text-xs text-slate-400 sm:inline">
            ¿Buscas a alguien?
          </span>
          <a
            href="https://desaparecidosterremotovenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-700/60 bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600"
          >
            <UserSearch className="h-3.5 w-3.5" />
            Buscar desaparecidos
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
          <a
            href="https://venezuelatebusca.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-700/60 bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600"
          >
            <UserSearch className="h-3.5 w-3.5" />
            Venezuela te busca
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        </div>
      </div>
    </header>
  );
}
