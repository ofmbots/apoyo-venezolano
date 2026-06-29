-- ============================================================
-- 05_auth_trigger.sql — Trigger que crea el perfil al registrarse
-- ============================================================
-- PROBLEMA: sin esta función, el trigger on_auth_user_created
-- llama a handle_new_user() que no existe → "Database error saving new user".
-- SOLUCIÓN: crear la función con COALESCE para manejar metadata parcial.
-- ============================================================

-- 1. Función que auto-crea la fila en public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, cedula, telefono_whatsapp, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre_completo', ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'cedula', ''), 'AUTO-' || LEFT(NEW.id::text, 8)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'telefono_whatsapp', ''), ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Recrear el trigger (elimina el roto si existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
