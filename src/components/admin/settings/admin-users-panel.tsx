import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

import { AdminClientesRoleBadge } from '@/components/admin/clientes/admin-clientes-role-badge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminProfiles } from '@/hooks/use-admin-dashboard';
import { useAdminUserRoleMutation } from '@/hooks/use-admin-users';
import { CUSTOMER_EDIT_ROLES } from '@/lib/customers-by-role';
import type { CustomerRoleGroupKey } from '@/lib/customers-by-role';
import { isUserRole } from '@/types/product';
import type { UserProfile } from '@/types/product';

function profileRoleGroup(role: string): CustomerRoleGroupKey {
  if (role === 'admin') return 'admin';
  if (role === 'tecnico' || role === 'corporativo') return 'tecnico';
  if (role === 'distribuidor' || role === 'vip') return 'distribuidor';
  if (role === 'mayorista') return 'mayorista';
  return 'public';
}

function profileDisplayName(profile: UserProfile): string {
  return profile.full_name?.trim() || profile.email?.trim() || 'Sin nombre';
}

function matchesSearch(profile: UserProfile, query: string): boolean {
  const haystack = [profile.full_name, profile.email, profile.role].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query);
}

export function AdminUsersPanel() {
  const { data: profiles = [], isLoading, isError } = useAdminProfiles();
  const updateRole = useAdminUserRoleMutation();
  const [query, setQuery] = useState('');

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = [...profiles].sort((a, b) =>
      profileDisplayName(a).localeCompare(profileDisplayName(b), 'es'),
    );
    if (!normalized) return list;
    return list.filter((profile) => matchesSearch(profile, normalized));
  }, [profiles, query]);

  const handleRoleChange = async (profile: UserProfile, nextRole: string) => {
    if (!isUserRole(nextRole) || nextRole === profile.role) return;

    try {
      await updateRole.mutateAsync({ id: profile.id, role: nextRole });
      toast.success('Rol actualizado correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el rol');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando usuarios…</p>;
  }

  if (isError) {
    return (
      <AdminEmptyState
        title="No se pudieron cargar los usuarios"
        description="Verifica la conexión con Supabase y vuelve a intentarlo."
      />
    );
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Usuarios del sistema</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {profiles.length} cuenta{profiles.length === 1 ? '' : 's'} registrada{profiles.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o rol…"
            className="h-9 pl-9"
            aria-label="Buscar usuarios"
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <AdminEmptyState
          title={query ? 'Sin resultados' : 'Sin usuarios registrados'}
          description={
            query
              ? 'Prueba con otro término de búsqueda.'
              : 'Las cuentas con acceso al sistema aparecerán aquí.'
          }
          className="rounded-none border-0 bg-transparent"
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[11rem] px-4">Nombre</TableHead>
                <TableHead className="min-w-[12rem]">Correo</TableHead>
                <TableHead className="min-w-[8rem]">Rol</TableHead>
                <TableHead className="min-w-[10rem]">Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const role = isUserRole(profile.role) ? profile.role : 'public';

                return (
                  <TableRow key={profile.id}>
                    <TableCell className="px-4 font-medium text-foreground">
                      {profileDisplayName(profile)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profile.email ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <AdminClientesRoleBadge role={profileRoleGroup(profile.role)} />
                        <Select
                          value={role}
                          onValueChange={(value) => void handleRoleChange(profile, value)}
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className="h-8 w-[10.5rem] bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUSTOMER_EDIT_ROLES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {profile.created_at
                        ? format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: es })
                        : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
