"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoriaInsumo, EstadoCentro, RolUsuario } from "@/lib/types";

function conError(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

// ───────────── Solicitudes ─────────────
export async function resolverSolicitud(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const accion = String(formData.get("accion") ?? "");
  const estado = accion === "aprobar" ? "aprobado" : "rechazado";

  const { error } = await supabase
    .from("solicitudes_insumos")
    .update({ estado_aprobacion: estado })
    .eq("id", id);

  if (error) conError("/admin/solicitudes", error.message);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
}

// ───────────── Insumos ─────────────
export async function crearInsumo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "otro") as CategoriaInsumo;
  const unidad = String(formData.get("unidad") ?? "unidad").trim() || "unidad";

  if (!nombre) conError("/admin/insumos", "El nombre es obligatorio.");

  const { error } = await supabase
    .from("catalogo_insumos")
    .insert({ nombre, categoria, unidad });

  if (error) {
    if (error.code === "23505") conError("/admin/insumos", "Ya existe un insumo con ese nombre.");
    conError("/admin/insumos", error.message);
  }
  revalidatePath("/admin/insumos");
}

export async function editarInsumo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "otro") as CategoriaInsumo;
  const unidad = String(formData.get("unidad") ?? "unidad").trim() || "unidad";

  if (!nombre) conError("/admin/insumos", "El nombre es obligatorio.");

  const { error } = await supabase
    .from("catalogo_insumos")
    .update({ nombre, categoria, unidad })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") conError("/admin/insumos", "Ya existe un insumo con ese nombre.");
    conError("/admin/insumos", error.message);
  }
  revalidatePath("/admin/insumos");
}

export async function eliminarInsumo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase.from("catalogo_insumos").delete().eq("id", id);

  if (error) {
    if (error.code === "23503")
      conError("/admin/insumos", "No se puede eliminar: hay solicitudes que usan este insumo.");
    conError("/admin/insumos", error.message);
  }
  revalidatePath("/admin/insumos");
}

// ───────────── Centros ─────────────
export async function eliminarCentro(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  await supabase.from("centros").update({ responsable_id: null }).eq("id", id);
  await supabase.from("profiles").update({ centro_id: null }).eq("centro_id", id);

  const { error } = await supabase.from("centros").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      conError("/admin/centros", "No se puede eliminar: tiene solicitudes vinculadas. Ciérralo primero.");
    conError("/admin/centros", error.message);
  }
  revalidatePath("/admin/centros");
  revalidatePath("/");
}

export async function cambiarEstadoCentro(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "activo") as EstadoCentro;

  const { error } = await supabase.from("centros").update({ estado }).eq("id", id);
  if (error) conError("/admin/centros", error.message);
  revalidatePath("/admin/centros");
  revalidatePath("/");
}

export async function asignarResponsable(formData: FormData) {
  const { supabase } = await requireAdmin();
  const centro_id = String(formData.get("centro_id") ?? "");
  const profile_id = String(formData.get("profile_id") ?? "");

  // Quitar responsable
  if (!profile_id) {
    const { error } = await supabase
      .from("centros")
      .update({ responsable_id: null })
      .eq("id", centro_id);
    if (error) conError("/admin/centros", error.message);
    revalidatePath("/admin/centros");
    return;
  }

  // Asignar: marca el centro y promueve al usuario a responsable de ese centro
  const { error: e1 } = await supabase
    .from("centros")
    .update({ responsable_id: profile_id })
    .eq("id", centro_id);
  if (e1) conError("/admin/centros", e1.message);

  const { error: e2 } = await supabase
    .from("profiles")
    .update({ rol: "responsable", centro_id })
    .eq("id", profile_id);
  if (e2) conError("/admin/centros", e2.message);

  revalidatePath("/admin/centros");
  revalidatePath("/admin/usuarios");
}

// ───────────── Usuarios ─────────────
export async function aprobarUsuario(formData: FormData) {
  const { supabase } = await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");

  const { error } = await supabase
    .from("profiles")
    .update({ estado: "activo", rol: "responsable" })
    .eq("id", profile_id);

  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function rechazarUsuario(formData: FormData) {
  const { supabase } = await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");

  const { error } = await supabase
    .from("profiles")
    .update({ estado: "rechazado" })
    .eq("id", profile_id);

  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
}

export async function cambiarRol(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");
  const rol = String(formData.get("rol") ?? "donante") as RolUsuario;

  // Evita que el admin se quite a sí mismo el rol y se quede fuera
  if (profile_id === user.id && rol !== "admin") {
    conError("/admin/usuarios", "No puedes quitarte tu propio rol de admin.");
  }

  const update: { rol: RolUsuario; centro_id?: null } = { rol };
  // Si deja de ser responsable, se desvincula del centro
  if (rol !== "responsable") update.centro_id = null;

  const { error } = await supabase.from("profiles").update(update).eq("id", profile_id);
  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function editarNombre(formData: FormData) {
  const { supabase } = await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");
  const nombre_completo = String(formData.get("nombre_completo") ?? "").trim();

  if (!nombre_completo) conError("/admin/usuarios", "El nombre no puede estar vacío.");

  const { error } = await supabase
    .from("profiles")
    .update({ nombre_completo })
    .eq("id", profile_id);

  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
}

export async function resetearPassword(formData: FormData) {
  await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");
  const nueva = String(formData.get("nueva_password") ?? "").trim();

  if (nueva.length < 6) conError("/admin/usuarios", "La contraseña debe tener al menos 6 caracteres.");

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(profile_id, {
    password: nueva,
  });

  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
}

export async function asignarCentroUsuario(formData: FormData) {
  const { supabase } = await requireAdmin();
  const profile_id = String(formData.get("profile_id") ?? "");
  const centro_id = String(formData.get("centro_id") ?? "") || null;

  const { error } = await supabase
    .from("profiles")
    .update({ centro_id })
    .eq("id", profile_id);
  if (error) conError("/admin/usuarios", error.message);
  revalidatePath("/admin/usuarios");
}
