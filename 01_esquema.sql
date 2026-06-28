-- ============================================================
-- 01_esquema.sql — Tablas y tipos base
-- ============================================================

-- Tipos
create type rol_usuario as enum ('admin', 'responsable', 'donante');
create type estado_centro as enum ('activo', 'cerrado');
create type tipo_centro as enum ('hospital', 'refugio', 'temporal', 'otro');
create type categoria_insumo as enum ('agua', 'alimentos', 'medicinas', 'higiene', 'ropa', 'equipo_medico', 'combustible', 'otro');
create type prioridad_solicitud as enum ('urgente', 'normal');
create type estado_aprobacion as enum ('pendiente', 'aprobado', 'rechazado');

-- Centros (hospitales, refugios, puntos temporales)
create table public.centros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo tipo_centro not null default 'otro',
  direccion text,
  lat double precision not null,
  lng double precision not null,
  responsable_id uuid,
  estado estado_centro not null default 'activo',
  telefono_contacto text,
  created_at timestamptz not null default now()
);

-- Perfiles de usuario (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  cedula text not null unique,
  telefono_whatsapp text not null,
  email text not null,
  rol rol_usuario not null default 'donante',
  centro_id uuid references public.centros(id),
  created_at timestamptz not null default now()
);

alter table public.centros
  add constraint fk_centros_responsable foreign key (responsable_id) references public.profiles(id);

-- Catalogo maestro de insumos
create table public.catalogo_insumos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  categoria categoria_insumo not null default 'otro',
  unidad text not null default 'unidad',
  created_at timestamptz not null default now()
);

-- Solicitudes de insumos por centro (flujo de aprobacion)
create table public.solicitudes_insumos (
  id uuid primary key default gen_random_uuid(),
  centro_id uuid not null references public.centros(id) on delete cascade,
  insumo_id uuid not null references public.catalogo_insumos(id),
  cantidad_necesaria numeric not null check (cantidad_necesaria > 0),
  prioridad prioridad_solicitud not null default 'normal',
  estado_aprobacion estado_aprobacion not null default 'pendiente',
  creado_por uuid not null references public.profiles(id),
  aprobado_por uuid references public.profiles(id),
  fecha_creacion timestamptz not null default now(),
  fecha_aprobacion timestamptz
);

create index idx_solicitudes_centro on public.solicitudes_insumos(centro_id);
create index idx_solicitudes_insumo on public.solicitudes_insumos(insumo_id);
create index idx_solicitudes_estado on public.solicitudes_insumos(estado_aprobacion);
create index idx_centros_estado on public.centros(estado);
