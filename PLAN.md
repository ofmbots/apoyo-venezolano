# PLAN — Donaciones Venezuela (para Claude Code)

Plataforma de matching de donaciones. MVP modular, fases incrementales.

---

## 0. Antes de arrancar Claude Code

### 0.1 Crear proyecto Supabase

1. Entrar a https://supabase.com → New project.
2. Nombre: `donaciones-venezuela`.
3. Región: **South America (São Paulo)**.
4. Anotar la **Project URL** y la **anon public key** (Settings → API).

### 0.2 Ejecutar migrations

En el SQL Editor de Supabase, ejecutar EN ORDEN:

1. `01_esquema.sql`
2. `02_seguridad.sql`
3. `03_matching.sql`
4. `04_seed_catalogo.sql`

### 0.3 Crear el primer admin

Después de registrarte en la app (Fase 1), entrar al SQL Editor y ejecutar:

```sql
update public.profiles set rol = 'admin' where email = 'TU_EMAIL_AQUI';
```

### 0.4 Comprar dominio

- Registrador: Cloudflare Registrar o Namecheap.
- Extensión: `.org`.
- NO usar `.ve` (lo controla CONATEL).
- Apuntar DNS a Cloudflare con proxy activado (naranja).

---

## 1. Stack

| Pieza | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Estilos | Tailwind CSS + shadcn/ui |
| Mapa | Leaflet + react-leaflet + OpenStreetMap |
| Backend | Supabase (Postgres + Auth + RLS) |
| Hosting | Cloudflare Pages |
| Deploy | `git push` → Cloudflare auto-deploy |

---

## 2. Estructura del proyecto

```
donaciones-venezuela/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Home + mapa global
│   │   ├── donar/page.tsx            # Flujo de donante
│   │   └── centros/[id]/page.tsx     # Detalle de centro
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   ├── (app)/
│   │   ├── solicitar/page.tsx        # Crear solicitud de insumo
│   │   ├── panel/page.tsx            # Panel responsable/admin
│   │   └── admin/
│   │       ├── centros/page.tsx
│   │       └── usuarios/page.tsx
│   └── layout.tsx
├── components/
│   ├── mapa/
│   │   ├── MapaCentros.tsx           # Mapa con pines clickables
│   │   └── PinCentro.tsx
│   ├── ui/                           # shadcn
│   ├── CentroCard.tsx
│   └── BuscadorInsumo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Cliente browser
│   │   └── server.ts                 # Cliente server
│   ├── types.ts                      # Tipos TS de la BD
│   └── geo.ts                        # Geolocalización browser
├── migrations/
│   ├── 01_esquema.sql
│   ├── 02_seguridad.sql
│   ├── 03_matching.sql
│   └── 04_seed_catalogo.sql
├── .env.local
└── package.json
```

---

## 3. Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

## 4. Roadmap por fases

### Fase 1 — Núcleo (auth + listado + mapa)

- [ ] Setup Next.js + Tailwind + shadcn.
- [ ] Conectar Supabase (cliente browser y server).
- [ ] `/registro`: formulario con nombre completo, cédula, WhatsApp, email, contraseña. Inserta en `auth.users` y `profiles` (rol por defecto: donante).
- [ ] `/login`.
- [ ] `/` home: mapa de Venezuela con todos los centros activos. Click en pin → popup con nombre, tipo, dirección, "ver detalle".
- [ ] `/centros/[id]`: detalle del centro con su lista de insumos aprobados.

**Criterio de "hecho":** Un usuario puede registrarse, entrar, y ver el mapa con centros.

### Fase 2 — Solicitudes de insumo

- [ ] `/solicitar`: cualquier usuario logueado elige un centro + un insumo del catálogo + cantidad + prioridad. Se guarda como `pendiente`.
- [ ] `/panel`: 
  - Responsable: ve solicitudes pendientes de SU centro, aprueba/rechaza.
  - Admin: ve TODAS las solicitudes pendientes, aprueba/rechaza.
- [ ] Trigger SQL ya registra quién aprobó y cuándo.

**Criterio:** Un donante crea solicitud → responsable aprueba → aparece pública.

### Fase 3 — Flujo del donante (matching)

- [ ] `/donar`: 
  - Paso 1: pedir ubicación del navegador (o input manual).
  - Paso 2: buscador de insumo (autocomplete sobre `catalogo_insumos`).
  - Paso 3: llamar a `buscar_centros_con_insumo()` vía Supabase RPC.
  - Si hay resultados → mostrar el centro más cercano destacado + mapa.
  - Si no hay → mensaje "Ningún centro tiene registrada esa necesidad" + llamar a `centros_mas_cercanos()` y mostrar lista.
- [ ] Botón "Llamar" (tel:) y "WhatsApp" (wa.me) usando el `telefono_contacto` del centro.

**Criterio:** Donante busca "agua potable" en Caracas → ve hospital El Llanito a 1.2 km.

### Fase 4 — Admin

- [ ] `/admin/centros`: crear/editar/cerrar centros, asignar responsable.
- [ ] `/admin/usuarios`: cambiar rol, ver registros, banear.
- [ ] Dashboard simple: total centros, total solicitudes aprobadas hoy, top insumos demandados.

### Fase 5 — Futuro (NO ahora)

- Confirmación de entrega (donante marca "entregado" → responsable confirma).
- Historial de donaciones por usuario.
- Notificaciones por WhatsApp (Twilio o WhatsApp Business API).
- Verificación KYC reforzada de responsables.
- Sistema de reportes/abuso.
- Estadísticas públicas.

---

## 5. Mapa "estilo Airbnb"

- Librería: `react-leaflet` con tile layer de OpenStreetMap (gratis).
- Cluster de pines cuando hay muchos: `react-leaflet-cluster`.
- Pin custom con color por tipo (hospital=rojo, refugio=azul, temporal=naranja).
- Al pasar el ratón sobre la card en el listado lateral → resalta el pin (y viceversa).
- Mobile: bottom-sheet con los centros visibles en el viewport actual.

Centro inicial del mapa: Caracas `[10.4806, -66.9036]`, zoom 7 para ver Venezuela entera.

---

## 6. Seguridad ya incluida en las migrations

- RLS activo en todas las tablas.
- Un usuario normal NO puede auto-asignarse rol de admin o responsable (trigger lo bloquea).
- Solo el responsable de un centro aprueba solicitudes de SU centro; admin aprueba cualquiera.
- Solicitudes pendientes solo las ve quien las creó + responsable del centro + admin.
- Cédula es única (un humano = una cuenta).

---

## 7. Deploy

1. Repo en GitHub.
2. Cloudflare Pages → conectar repo → framework: Next.js.
3. Build command: `npm run build`. Output: `.next`.
4. Variables de entorno: pegar las dos de Supabase.
5. Dominio custom: añadir tu `.org` en Cloudflare Pages → DNS automático.

---

## 8. Cómo pedírselo a Claude Code

Abre Claude Code en una carpeta vacía y dile literalmente:

> Lee `PLAN.md` y `HISTORIAL.md`. Empezamos por la Fase 1. Crea el proyecto Next.js con Tailwind y shadcn, conecta Supabase con las credenciales que te paso, e implementa: registro, login, home con mapa de Venezuela mostrando centros activos, y detalle de centro. Cuando termines, actualiza HISTORIAL.md.

Y le pasas las credenciales de Supabase (URL + anon key).
