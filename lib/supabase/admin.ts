import { createClient } from "@supabase/supabase-js";

// Cliente con service role — solo para Server Actions del admin.
// NUNCA exponer al cliente ni usar en componentes de cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
