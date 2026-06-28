"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PrioridadSolicitud, TipoCentro } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | null;

// ── Registrar necesidad (solicitud de insumo, queda pendiente de aprobación) ──
export async function crearSolicitud(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/solicitar");

  const centro_id = String(formData.get("centro_id") ?? "");
  if (!centro_id) return { error: "Elige un centro." };

  const categoriaLibre = String(formData.get("categoria_libre") ?? "").trim();
  const insumoLibre = String(formData.get("insumo_libre") ?? "").trim();

  // Ruta libre: el usuario describió algo que no está en el catálogo
  if (categoriaLibre || insumoLibre) {
    const descripcion = categoriaLibre
      ? `Categoría no listada: "${categoriaLibre}"`
      : `Insumo no listado: "${insumoLibre}"`;

    const { error } = await supabase.from("mensajes_admin").insert({
      tipo: "solicitud_insumo_libre",
      mensaje: descripcion,
      centro_id,
      enviado_por: user.id,
    });

    if (error) return { error: "No se pudo enviar: " + error.message };
    return { ok: true };
  }

  // Ruta normal: insumo del catálogo
  const insumo_id = String(formData.get("insumo_id") ?? "");
  const cantidad_necesaria = Number(formData.get("cantidad_necesaria") ?? 0);
  const prioridad: PrioridadSolicitud = "normal";

  if (!insumo_id) return { error: "Elige un insumo." };
  if (!cantidad_necesaria || cantidad_necesaria <= 0) {
    return { error: "La cantidad debe ser mayor que cero." };
  }

  const { error } = await supabase.from("solicitudes_insumos").insert({
    centro_id,
    insumo_id,
    cantidad_necesaria,
    prioridad,
    estado_aprobacion: "pendiente",
    creado_por: user.id,
  });

  if (error) {
    return { error: "No se pudo registrar la necesidad: " + error.message };
  }

  revalidatePath(`/centros/${centro_id}`);
  redirect(`/centros/${centro_id}?ok=necesidad`);
}

// ── Registrar centro (solo admin por RLS) ──
export async function crearCentro(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/centros/nuevo");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "hospital") as TipoCentro;
  const direccion = String(formData.get("direccion") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const telefono_contacto = String(formData.get("telefono_contacto") ?? "").trim();
  const fechaHastaRaw = formData.get("fecha_hasta");
  const fecha_hasta = fechaHastaRaw ? new Date(String(fechaHastaRaw)).toISOString() : null;

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (tipo === "temporal" && !fecha_hasta) {
    return { error: "Los puntos temporales requieren fecha y hora de cierre." };
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "Latitud y longitud deben ser números válidos." };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: "Coordenadas fuera de rango." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const esAdmin = profile?.rol === "admin";

  const { data, error } = await supabase
    .from("centros")
    .insert({
      nombre,
      tipo,
      direccion: direccion || null,
      lat,
      lng,
      telefono_contacto: telefono_contacto || null,
      fecha_hasta,
      estado: esAdmin ? "activo" : "pendiente",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "No se pudo crear el centro: " + error.message };
  }

  if (esAdmin) {
    revalidatePath("/");
    redirect(`/centros/${data!.id}`);
  }

  await supabase.from("mensajes_admin").insert({
    tipo: "solicitud_centro",
    mensaje: `Solicitud de nuevo centro: "${nombre}" (${tipo})${direccion ? ` en ${direccion}` : ""}.`,
    centro_id: data!.id,
    enviado_por: user.id,
  });

  revalidatePath("/admin/centros");
  return { ok: true };
}

// ── Enviar reporte o sugerencia al admin ──
export async function enviarReporte(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tipo = String(formData.get("tipo") ?? "error");
  const mensajeBase = String(formData.get("mensaje") ?? "").trim();
  const telefonoSugerido = String(formData.get("telefono_sugerido") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const centro_id = formData.get("centro_id")
    ? String(formData.get("centro_id"))
    : null;

  const mensaje = telefonoSugerido
    ? `${mensajeBase} | Teléfono sugerido: ${telefonoSugerido}`
    : mensajeBase;

  if (!mensaje) return { error: "Describe el problema antes de enviar." };

  const { error } = await supabase.from("mensajes_admin").insert({
    tipo,
    mensaje,
    email: email || null,
    centro_id: centro_id || null,
    enviado_por: user?.id ?? null,
  });

  if (error) return { error: "No se pudo enviar: " + error.message };
  return { ok: true };
}

// ── Marcar mensaje admin como resuelto ──
export async function marcarMensajeResuelto(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("mensajes_admin").update({ estado: "resuelto" }).eq("id", id);
  revalidatePath("/admin/mensajes");
}
