-- ============================================================
-- 02_seguridad.sql — Row Level Security + triggers anti-fraude
-- ============================================================

-- Helper: ¿el usuario actual es admin?
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- Helper: centro_id del responsable actual (null si no es responsable)
create or replace function public.mi_centro_id()
returns uuid
language sql
security definer
stable
as $$
  select centro_id from public.profiles where id = auth.uid() and rol = 'responsable';
$$;

alter table public.centros enable row level security;
alter table public.profiles enable row level security;
alter table public.catalogo_insumos enable row level security;
alter table public.solicitudes_insumos enable row level security;

-- CENTROS
create policy "centros_select_public" on public.centros
  for select using (true);

create policy "centros_insert_admin" on public.centros
  for insert with check (public.es_admin());

create policy "centros_update_admin_o_responsable" on public.centros
  for update using (public.es_admin() or responsable_id = auth.uid());

create policy "centros_delete_admin" on public.centros
  for delete using (public.es_admin());

-- PROFILES
create policy "profiles_select_propio_o_admin" on public.profiles
  for select using (id = auth.uid() or public.es_admin());

create policy "profiles_insert_propio" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_propio_campos_seguros" on public.profiles
  for update using (id = auth.uid() or public.es_admin());

-- CATALOGO_INSUMOS
create policy "catalogo_select_public" on public.catalogo_insumos
  for select using (true);

create policy "catalogo_insert_autenticado" on public.catalogo_insumos
  for insert with check (auth.uid() is not null);

-- SOLICITUDES_INSUMOS
create policy "solicitudes_select_aprobadas_o_propias_o_responsable_o_admin" on public.solicitudes_insumos
  for select using (
    estado_aprobacion = 'aprobado'
    or creado_por = auth.uid()
    or centro_id = public.mi_centro_id()
    or public.es_admin()
  );

create policy "solicitudes_insert_autenticado" on public.solicitudes_insumos
  for insert with check (
    auth.uid() is not null
    and creado_por = auth.uid()
    and estado_aprobacion = 'pendiente'
    and aprobado_por is null
  );

create policy "solicitudes_update_responsable_o_admin" on public.solicitudes_insumos
  for update using (
    public.es_admin() or centro_id = public.mi_centro_id()
  );

create policy "solicitudes_delete_propia_pendiente_o_admin" on public.solicitudes_insumos
  for delete using (
    public.es_admin() or (creado_por = auth.uid() and estado_aprobacion = 'pendiente')
  );

-- Evitar que un usuario se auto-asigne rol/centro al insertar su perfil
create or replace function public.proteger_rol_en_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.es_admin() then
    new.rol := 'donante';
    new.centro_id := null;
  end if;
  return new;
end;
$$;

create trigger trg_proteger_rol_insert
  before insert on public.profiles
  for each row execute function public.proteger_rol_en_insert();

-- Evitar que un usuario normal cambie su propio rol/centro_id en un update
create or replace function public.proteger_rol_en_update()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.es_admin() then
    new.rol := old.rol;
    new.centro_id := old.centro_id;
  end if;
  return new;
end;
$$;

create trigger trg_proteger_rol_update
  before update on public.profiles
  for each row execute function public.proteger_rol_en_update();

-- Registrar quien y cuando aprueba/rechaza una solicitud
create or replace function public.completar_aprobacion()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.estado_aprobacion is distinct from old.estado_aprobacion and new.estado_aprobacion in ('aprobado','rechazado') then
    new.aprobado_por := auth.uid();
    new.fecha_aprobacion := now();
  end if;
  return new;
end;
$$;

create trigger trg_completar_aprobacion
  before update on public.solicitudes_insumos
  for each row execute function public.completar_aprobacion();
