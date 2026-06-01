/** @typedef {{ email?: string; role?: string }} AuthLikeUser */

export const ADMIN_PANEL_EMAILS = ['admin@haitech.pe', 'soporte@haitech.pe'];

export function normalizeAuthEmail(email) {
  return (email ?? '').trim().toLowerCase();
}

export function isAdminPanelEmail(email) {
  return ADMIN_PANEL_EMAILS.includes(normalizeAuthEmail(email));
}

/** @param {AuthLikeUser | null | undefined} user */
export function canAccessAdminPanel(user) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'tecnico') return true;
  return isAdminPanelEmail(user.email);
}

/** @param {AuthLikeUser | null | undefined} user */
export function hasAdminApiAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return isAdminPanelEmail(user.email);
}

/**
 * Rol efectivo al iniciar sesión (prioriza cuentas bootstrap del equipo).
 * @param {string} email
 * @param {string | undefined} profileRole
 */
export function resolveBootstrapRole(email, profileRole) {
  const normalized = normalizeAuthEmail(email);
  if (normalized === 'admin@haitech.pe' || normalized === 'soporte@haitech.pe') {
    return 'admin';
  }
  return profileRole;
}
