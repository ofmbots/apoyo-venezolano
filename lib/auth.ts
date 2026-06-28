import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Exige sesión. Si no hay usuario, redirige a /login?next=<rutaActual>.
// Devuelve { user, profile, supabase } si está autenticado.
export async function requireUser(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as Profile | null, supabase };
}

// Exige sesión + rol admin. Si no hay sesión -> login; si no es admin -> home.
export async function requireAdmin(nextPath = "/admin") {
  const { user, profile, supabase } = await requireUser(nextPath);
  if (profile?.rol !== "admin") {
    redirect("/");
  }
  return { user, profile: profile as Profile, supabase };
}
