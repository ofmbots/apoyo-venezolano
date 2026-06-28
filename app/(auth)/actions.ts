"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/navigation";

export type AuthState = { error?: string; mensaje?: string } | null;

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = rutaSegura(formData.get("next") as string | null);

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traducirError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function registro(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombre_completo = String(formData.get("nombre_completo") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim();
  const telefono_whatsapp = String(formData.get("telefono_whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = rutaSegura(formData.get("next") as string | null);

  if (!nombre_completo || !cedula || !telefono_whatsapp || !email || !password) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo, cedula, telefono_whatsapp },
    },
  });

  if (error) {
    return { error: traducirError(error.message) };
  }

  // Si ya hay sesion (confirmacion desactivada) -> entrar directo.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  // El email se auto-confirma en la BD, asi que intentamos iniciar sesion al instante.
  const { error: errorLogin } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (!errorLogin) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  // Fallback (si la confirmacion por correo siguiera activa).
  return {
    mensaje:
      "Cuenta creada. Revisa tu correo y confirma tu email para poder iniciar sesión.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese email.";
  if (m.includes("duplicate key") && m.includes("cedula"))
    return "Ya existe una cuenta con esa cédula.";
  if (m.includes("duplicate key") && m.includes("email"))
    return "Ya existe una cuenta con ese email.";
  if (m.includes("email not confirmed"))
    return "Debes confirmar tu email antes de iniciar sesión.";
  return msg;
}
