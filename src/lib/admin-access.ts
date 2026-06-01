import type { AuthUser } from '@/lib/auth-storage';
import type { UserRole } from '@/types/product';

/** Cuentas con acceso al panel aunque el perfil aún diga «public». */
export const ADMIN_PANEL_EMAILS = ['admin@haitech.pe', 'soporte@haitech.pe'] as const;

export type AdminPanelEmail = (typeof ADMIN_PANEL_EMAILS)[number];

export function normalizeAuthEmail(email: string | undefined | null): string {
  return email?.trim().toLowerCase() ?? '';
}

export function isAdminPanelEmail(email: string | undefined | null): boolean {
  const normalized = normalizeAuthEmail(email);
  return (ADMIN_PANEL_EMAILS as readonly string[]).includes(normalized);
}

/** Acceso a rutas /admin (UI). */
export function canAccessAdminPanel(
  user: AuthUser | null,
  role: UserRole | 'public',
): boolean {
  if (!user) return false;
  if (role === 'admin' || role === 'tecnico') return true;
  return isAdminPanelEmail(user.email);
}

/** Operaciones API que exigen rol administrador pleno. */
export function hasAdminApiAccess(
  user: AuthUser | null,
  role: UserRole | 'public',
): boolean {
  if (!user) return false;
  if (role === 'admin') return true;
  return isAdminPanelEmail(user.email);
}
