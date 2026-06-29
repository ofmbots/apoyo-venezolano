-- ============================================================
-- 06_estado_usuario.sql — Aprobación de usuarios por admin
-- ============================================================
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Tipo enum para el estado de cada cuenta
DO $$ BEGIN
  CREATE TYPE estado_usuario AS ENUM ('pendiente', 'activo', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Columna estado en profiles (default: pendiente para nuevos registros)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS estado estado_usuario NOT NULL DEFAULT 'pendiente';

-- 3. Los usuarios ya existentes pasan directamente a activo
UPDATE public.profiles SET estado = 'activo';

-- 4. Trigger de INSERT: forzar estado=pendiente y rol=donante para no-admins
CREATE OR REPLACE FUNCTION public.proteger_rol_en_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.es_admin() THEN
    new.rol    := 'donante';
    new.centro_id := null;
    new.estado := 'pendiente';
  END IF;
  RETURN new;
END;
$$;

-- 5. Trigger de UPDATE: proteger rol, centro_id y estado para no-admins
CREATE OR REPLACE FUNCTION public.proteger_rol_en_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.es_admin() THEN
    new.rol       := old.rol;
    new.centro_id := old.centro_id;
    new.estado    := old.estado;
  END IF;
  RETURN new;
END;
$$;
