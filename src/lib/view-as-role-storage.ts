import { isUserRole, type UserRole } from '@/lib/roles';

const VIEW_AS_ROLES_KEY = 'haistore_view_as_roles';
const LEGACY_VIEW_AS_ROLE_KEY = 'haistore_view_as_role';

function isPreviewableRole(value: unknown): value is UserRole {
  return typeof value === 'string' && isUserRole(value) && value !== 'admin';
}

function parseRolesJson(raw: string): UserRole[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPreviewableRole);
  } catch {
    return [];
  }
}

export function readViewAsRoles(): UserRole[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(VIEW_AS_ROLES_KEY);
  if (stored) {
    const roles = parseRolesJson(stored);
    if (roles.length > 0) return roles;
  }

  const legacy = localStorage.getItem(LEGACY_VIEW_AS_ROLE_KEY);
  if (legacy && isPreviewableRole(legacy)) {
    const migrated = [legacy];
    writeViewAsRoles(migrated);
    return migrated;
  }

  return [];
}

export function writeViewAsRoles(roles: UserRole[]): void {
  if (typeof window === 'undefined') return;
  if (roles.length === 0) {
    localStorage.removeItem(VIEW_AS_ROLES_KEY);
    localStorage.removeItem(LEGACY_VIEW_AS_ROLE_KEY);
    return;
  }
  localStorage.setItem(VIEW_AS_ROLES_KEY, JSON.stringify(roles));
  localStorage.removeItem(LEGACY_VIEW_AS_ROLE_KEY);
}
