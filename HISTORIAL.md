# HISTORIAL — Donaciones Venezuela

Plataforma de matching de donaciones para Venezuela (terremoto del 24/06/2026 + necesidades post-crisis). Modular, para irle añadiendo cosas.

## Concepto

- Listado de **centros** (hospitales, refugios, puntos temporales).
- Cada centro tiene un **responsable verificado** que registra qué insumos necesita.
- Cualquier usuario registrado puede **solicitar** que se añada un insumo a un centro (queda pendiente de aprobación).
- Aprueban: el responsable de ESE centro, o el admin (Ivan) para cualquier centro. No hay aprobación automática (anti-aprovechados).
- Un **donante** entra, dice qué quiere donar y dónde está → la plataforma le muestra el centro más cercano que lo necesita.
- Si nadie lo necesita → aviso + los centros activos más cercanos por si quiere llevarlo igual.
- **Mapa estilo Airbnb** con pines de los centros.

## Stack decidido

- **Frontend:** Next.js 15 (App Router) + Tailwind + shadcn/ui + Leaflet (mapas gratis, sin API key).
- **Backend:** Supabase (Postgres + Auth + RLS).
- **Hosting:** Cloudflare Pages (gratis, resistente a bloqueos en Venezuela).
- **Dominio:** .org en Cloudflare Registrar o Namecheap (NO .ve — lo gestiona CONATEL).
- **Región BD:** Brasil (sa-east-1), más cerca de Venezuela.

## Estado actual

- ✅ Esquema de BD diseñado (tablas, RLS, funciones de matching por distancia).
- ✅ Migrations SQL listas en archivos (`01`–`04`) + `05_handle_new_user` y `06_hardening_funciones`.
- ✅ Catálogo inicial de 17 insumos definido en `04_seed_catalogo.sql`.
- ✅ Proyecto Supabase creado en **South America (São Paulo)**, ref `fubazpcmcztybcqweyrx`. Migrations aplicadas, RLS activo, 17 insumos cargados.
- ✅ **Fase 1 del frontend construida y corriendo en local** (Next.js 15 + Tailwind + Leaflet + Supabase).
- ✅ 8 centros DEMO sembrados para validar el mapa (borrar antes de producción si se desea).
- ⏳ Validación local por Ivan.
- ⏳ Fase 2 en adelante.
- ⏳ Dominio por comprar.
- ⏳ Deploy a producción (Cloudflare Pages / Netlify).

## Fase 1 — hecho (27/06/2026)

- Auth: `/registro` (nombre, cédula, WhatsApp, email, contraseña) y `/login`. El profile se crea solo vía trigger `handle_new_user` en `auth.users`.
- Home `/`: mapa de Venezuela (Leaflet + OpenStreetMap) con pines por tipo de centro + listado lateral. Click en pin/tarjeta → detalle.
- Detalle `/centros/[id]`: datos del centro, botones Llamar/WhatsApp y lista de insumos aprobados.
- Stack confirmado: Next.js 15.5 (App Router), Tailwind 3, react-leaflet 5, @supabase/ssr.

## Rediseño + acciones (27/06/2026)

- **Tema nocturno** en toda la app (fondo oscuro con gradientes, superficies slate, acento amarillo Venezuela). Mapa con tiles **blancos** (CartoDB light) para contraste.
- Home rediseñada: hero con titular + stats + 3 tarjetas de acción.
- Tres acciones nuevas, todas detrás de login:
  - `/donar` — ubicación (geolocalización o manual) + insumo → matching por distancia (RPC `buscar_centros_con_insumo`, fallback `centros_mas_cercanos`).
  - `/solicitar` — registrar necesidad de un centro (queda pendiente).
  - `/centros/nuevo` — registrar centro (solo admin por RLS; a no-admin le avisa).
- **Redirect-back tras login**: si no hay sesión, las rutas protegidas mandan a `/login?next=<ruta>` y, tras entrar, vuelven a esa ruta. Validado (307 → login → destino).
- Util pura `lib/navigation.ts` (`rutaSegura`) separada de `lib/auth.ts` (server-only) para no arrastrar `next/headers` al cliente.

## Buscador + Panel admin (27/06/2026)

- **Buscador inteligente** en la home: coincidencia parcial e insensible a acentos (escribes "Cara" → encuentra "Caracas"). Filtra mapa + lista en vivo y muestra dropdown de sugerencias clicables (van al detalle). Combina con los chips de tipo.
- **Panel de administración** en `/admin` (protegido con `requireAdmin`, botón engranaje en navbar solo para admin):
  - **Resumen**: tarjetas con solicitudes pendientes, insumos, centros activos, usuarios/responsables.
  - **Solicitudes**: aprobar/rechazar pendientes + historial.
  - **Insumos**: CRUD completo (añadir / editar inline / eliminar) sobre `catalogo_insumos`.
  - **Centros**: activar/cerrar y asignar responsable (promueve al usuario a `responsable` del centro).
  - **Usuarios**: cambiar rol y vincular responsables a su centro. Protección: el admin no puede quitarse a sí mismo el rol.
- Migration `07_catalogo_admin_policies`: RLS update/delete de catálogo para admin.
- Para ver el panel: estar logueado **y** tener `rol = 'admin'`.

### Cómo probar en local (ya configurado, 27/06/2026)

Ya NO hace falta tocar el dashboard ni el SQL Editor. Migration `08`:
- **Auto-confirma el email** de cualquier registro (trigger en `auth.users`), se entra al instante.
- El email `onlyfanslaagencia@gmail.com` queda **admin automáticamente** al registrarse (resto = donante).
- El registro hace **auto-login** tras crear la cuenta.

Pasos: ir a `/registro` y registrarse con `onlyfanslaagencia@gmail.com` → entras como admin (aparece el botón ⚙️ Admin). Verificado a nivel de BD: ese email recibe rol `admin` y queda confirmado.

> ⚠️ Antes de producción: quitar/cambiar el hardcode del email admin en `08` y decidir si se mantiene la auto-confirmación de email.

## Tema visual

- **Bandera de Venezuela** (amarillo · azul · rojo) en: título principal del hero, botón "Donar", logo, marca "Venezuela" y franja superior de la navbar. Utilidades en `globals.css`: `.texto-bandera`, `.boton-bandera`, `.logo-bandera`, `.franja-bandera` + variante de botón `bandera`.

## Próximos pasos (en orden)

1. Validar Fase 1 en local (`npm run dev` → http://localhost:3000).
2. Construir Fase 2 (solicitudes de insumo + panel de aprobación).
3. Construir Fase 3 (flujo del donante con matching) y Fase 4 (admin).
4. Comprar dominio `.org` y apuntarlo a Cloudflare (DNS + proxy).
5. Deploy a producción y pegar las variables de entorno de Supabase.

## Modelo de datos (resumen)

- `profiles`: nombre_completo, cedula, telefono_whatsapp, email, rol (admin/responsable/donante), centro_id.
- `centros`: nombre, tipo, direccion, lat, lng, responsable_id, estado, telefono_contacto.
- `catalogo_insumos`: nombre, categoria, unidad.
- `solicitudes_insumos`: centro_id, insumo_id, cantidad_necesaria, prioridad, estado_aprobacion, creado_por, aprobado_por.

## Funciones SQL de matching (ya escritas)

- `buscar_centros_con_insumo(insumo_id, lat, lng)` → centros que necesitan ese insumo ordenados por distancia (Haversine).
- `centros_mas_cercanos(lat, lng, limite)` → fallback cuando nadie necesita ese insumo.

## Fases del frontend

1. **Fase 1 — Núcleo:** auth, registro de usuario con cédula/WhatsApp, listado de centros, mapa con pines.
2. **Fase 2 — Solicitudes:** crear solicitud de insumo, panel de aprobación para responsable/admin.
3. **Fase 3 — Donante:** flujo de búsqueda por insumo + ubicación, matching con fallback.
4. **Fase 4 — Admin:** crear centros, asignar responsables, ver todo.
5. **Fase 5 — Más adelante:** confirmación de entrega, historial, notificaciones WhatsApp, etc.
