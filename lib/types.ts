// Tipos de la base de datos (Fase 1). Reflejan las migrations SQL.

export type RolUsuario = "admin" | "responsable" | "donante";
export type EstadoCentro = "activo" | "cerrado" | "pendiente" | "pendiente_eliminacion";
export type TipoCentro = "hospital" | "centro_acopio" | "centro_medico" | "temporal";
export type CategoriaInsumo =
  | "agua"
  | "alimentos"
  | "medicinas"
  | "higiene"
  | "ropa"
  | "equipo_medico"
  | "combustible"
  | "herramientas"
  | "maquinaria"
  | "alojamiento"
  | "construccion"
  | "energia"
  | "rescate"
  | "transporte"
  | "comunicacion"
  | "mascotas"
  | "cocina"
  | "otro";
export type PrioridadSolicitud = "urgente" | "normal";
export type EstadoAprobacion = "pendiente" | "aprobado" | "rechazado";

export interface Centro {
  id: string;
  nombre: string;
  tipo: TipoCentro;
  direccion: string | null;
  lat: number;
  lng: number;
  responsable_id: string | null;
  estado: EstadoCentro;
  telefono_contacto: string | null;
  fecha_hasta: string | null;
  eliminacion_motivo: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nombre_completo: string;
  cedula: string;
  telefono_whatsapp: string;
  email: string;
  rol: RolUsuario;
  centro_id: string | null;
  created_at: string;
}

export interface CatalogoInsumo {
  id: string;
  nombre: string;
  categoria: CategoriaInsumo;
  unidad: string;
  created_at: string;
}

export interface SolicitudInsumo {
  id: string;
  centro_id: string;
  insumo_id: string;
  cantidad_necesaria: number;
  prioridad: PrioridadSolicitud;
  estado_aprobacion: EstadoAprobacion;
  creado_por: string;
  aprobado_por: string | null;
  fecha_creacion: string;
  fecha_aprobacion: string | null;
}

// Etiquetas legibles para la UI
export const TIPO_CENTRO_LABEL: Record<TipoCentro, string> = {
  hospital: "Hospital",
  centro_acopio: "Centro de acopio",
  centro_medico: "Centro médico",
  temporal: "Punto temporal",
};

export const CATEGORIA_INSUMO_VALUES: CategoriaInsumo[] = [
  "agua",
  "alimentos",
  "medicinas",
  "higiene",
  "ropa",
  "equipo_medico",
  "combustible",
  "herramientas",
  "maquinaria",
  "alojamiento",
  "construccion",
  "energia",
  "rescate",
  "transporte",
  "comunicacion",
  "mascotas",
  "cocina",
  "otro",
];

export const CATEGORIA_INSUMO_LABEL: Record<CategoriaInsumo, string> = {
  agua: "Agua",
  alimentos: "Alimentos",
  medicinas: "Medicinas",
  higiene: "Higiene",
  ropa: "Ropa",
  equipo_medico: "Equipo médico",
  combustible: "Combustible",
  herramientas: "Herramientas",
  maquinaria: "Maquinaria pesada",
  alojamiento: "Alojamiento y abrigo",
  construccion: "Materiales de construcción",
  energia: "Energía y electricidad",
  rescate: "Rescate y emergencia",
  transporte: "Transporte y vehículos",
  comunicacion: "Comunicación",
  mascotas: "Mascotas",
  cocina: "Cocina y menaje",
  otro: "Otro",
};

export const TIPO_CENTRO_VALUES: TipoCentro[] = [
  "hospital",
  "centro_acopio",
  "centro_medico",
  "temporal",
];

export const ROL_USUARIO_VALUES: RolUsuario[] = ["admin", "responsable", "donante"];

// Color del pin segun tipo de centro
export const TIPO_CENTRO_COLOR: Record<TipoCentro, string> = {
  hospital: "#dc2626",     // rojo
  centro_acopio: "#1d4ed8", // azul
  centro_medico: "#7c3aed", // violeta
  temporal: "#ea580c",      // naranja
};
