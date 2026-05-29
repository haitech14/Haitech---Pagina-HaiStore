import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import {
  PRICE_ROLE_LABELS,
  USER_ROLE_LABELS,
  isUserRole,
  type UserProfile,
  type UserRole,
} from '@/types/product';

const ASSIGNABLE_ROLES: UserRole[] = [
  'public',
  'corporativo',
  'tecnico',
  'mayorista',
  'distribuidor',
  'vip',
  'admin',
];

async function fetchProfiles(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/api/auth/profiles');
}

export function UsersRolesPanel() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading, isError } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchProfiles,
  });

  const updateRole = async (profileId: string, role: UserRole) => {
    await apiFetch(`/api/auth/profiles/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    void queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Roles de usuario</h2>
        <p className="text-muted-foreground">
          Asigna el rol de precio que verá cada usuario al iniciar sesión con Supabase.
        </p>
      </header>

      {isError && (
        <p role="alert" className="text-destructive">
          No se pudieron cargar los perfiles. Ejecuta la migración SQL en Supabase y verifica las
          credenciales del servidor.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol actual</th>
              <th className="px-4 py-3 font-medium">Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td colSpan={3} className="px-4 py-4">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              profiles?.map((profile) => (
                <tr key={profile.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{profile.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {isUserRole(profile.role)
                        ? USER_ROLE_LABELS[profile.role]
                        : profile.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {ASSIGNABLE_ROLES.map((role) => (
                        <Button
                          key={role}
                          type="button"
                          size="sm"
                          variant={profile.role === role ? 'default' : 'outline'}
                          className={
                            profile.role === role ? 'bg-red-600 hover:bg-red-500' : undefined
                          }
                          onClick={() => void updateRole(profile.id, role)}
                        >
                          {role === 'admin'
                            ? USER_ROLE_LABELS.admin
                            : PRICE_ROLE_LABELS[role]}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && profiles?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No hay usuarios registrados en Supabase aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
