import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { UserProfile, UserRole } from '@/types/product';

interface UpdateAdminUserInput {
  id: string;
  role: UserRole;
  full_name?: string;
}

export function useAdminUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role, full_name }: UpdateAdminUserInput) =>
      apiFetch<UserProfile>(`/api/auth/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...(full_name != null ? { full_name } : {}) }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
  });
}
