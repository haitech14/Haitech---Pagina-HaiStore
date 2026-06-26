import type { AuthUser } from '@/lib/auth-storage';
import { hasAdminApiAccess } from '@/lib/admin-access';
import type { UserRole } from '@/types/product';

/** Haibot (chat + CRM) solo para administradores. El resto usa WhatsApp flotante. */
export function canUseHaibot(
  user: AuthUser | null,
  role: UserRole | 'public',
): boolean {
  return hasAdminApiAccess(user, role);
}
