/** Rutas donde la barra inferior móvil no debe mostrarse. */
const HIDDEN_PREFIXES = ['/checkout', '/admin', '/login', '/registro'] as const;

export function shouldShowMobileBottomNav(pathname: string): boolean {
  return !HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
