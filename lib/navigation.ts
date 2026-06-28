// Utilidades de navegación puras (sin dependencias de servidor).
// Se pueden importar tanto desde cliente como desde servidor.

// Solo permite rutas internas (evita open-redirect a dominios externos).
export function rutaSegura(
  next: string | undefined | null,
  fallback = "/"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
