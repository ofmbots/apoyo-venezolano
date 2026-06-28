-- ============================================================
-- 03_matching.sql — Funciones de matching por distancia (Haversine)
-- ============================================================

-- Centros que SI tienen una necesidad aprobada de un insumo concreto, ordenados por distancia
create or replace function public.buscar_centros_con_insumo(
  insumo_buscado uuid,
  lat_donante double precision,
  lng_donante double precision
)
returns table (
  centro_id uuid,
  nombre text,
  tipo tipo_centro,
  direccion text,
  lat double precision,
  lng double precision,
  telefono_contacto text,
  cantidad_necesaria numeric,
  prioridad prioridad_solicitud,
  distancia_km double precision
)
language sql
stable
as $$
  select
    c.id, c.nombre, c.tipo, c.direccion, c.lat, c.lng, c.telefono_contacto,
    s.cantidad_necesaria, s.prioridad,
    6371 * acos(
      least(1, greatest(-1,
        cos(radians(lat_donante)) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(lng_donante))
        + sin(radians(lat_donante)) * sin(radians(c.lat))
      ))
    ) as distancia_km
  from public.solicitudes_insumos s
  join public.centros c on c.id = s.centro_id
  where s.insumo_id = insumo_buscado
    and s.estado_aprobacion = 'aprobado'
    and c.estado = 'activo'
  order by distancia_km asc;
$$;

-- Centros activos mas cercanos en general (fallback cuando nadie necesita ese insumo)
create or replace function public.centros_mas_cercanos(
  lat_donante double precision,
  lng_donante double precision,
  limite int default 5
)
returns table (
  centro_id uuid,
  nombre text,
  tipo tipo_centro,
  direccion text,
  lat double precision,
  lng double precision,
  telefono_contacto text,
  distancia_km double precision
)
language sql
stable
as $$
  select
    c.id, c.nombre, c.tipo, c.direccion, c.lat, c.lng, c.telefono_contacto,
    6371 * acos(
      least(1, greatest(-1,
        cos(radians(lat_donante)) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(lng_donante))
        + sin(radians(lat_donante)) * sin(radians(c.lat))
      ))
    ) as distancia_km
  from public.centros c
  where c.estado = 'activo'
  order by distancia_km asc
  limit limite;
$$;

grant execute on function public.buscar_centros_con_insumo(uuid, double precision, double precision) to anon, authenticated;
grant execute on function public.centros_mas_cercanos(double precision, double precision, int) to anon, authenticated;
