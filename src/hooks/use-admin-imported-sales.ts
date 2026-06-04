import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { authHeaders } from '@/lib/auth-storage';
import type {
  ImportedSalesListPayload,
  VentasImportResult,
} from '@/types/imported-sale';

export const ALL_IMPORTED_MONTHS = 'all' as const;

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

async function fetchImportedSales(monthParam: string): Promise<ImportedSalesListPayload> {
  const headers = await authHeaders();
  const path = `/api/sales-reports/admin?month=${encodeURIComponent(monthParam)}&limit=1000`;
  const response = await fetch(resolveApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ImportedSalesListPayload & {
    error?: string;
  };

  if (
    response.status === 503 &&
    (body.code === 'IMPORTED_SALES_TABLE_MISSING' || body.source === 'migration-required')
  ) {
    const payload: ImportedSalesListPayload = {
      documents: [],
      months: [],
      source: body.source ?? 'migration-required',
      code: 'IMPORTED_SALES_TABLE_MISSING',
    };
    if (body.migration) payload.migration = body.migration;
    if (body.error) payload.error = body.error;
    return payload;
  }

  if (!response.ok) {
    throw new Error(body.error ?? `Error ${response.status} al cargar el histórico ERP`);
  }

  return body;
}

export function useImportedSales(month: string | typeof ALL_IMPORTED_MONTHS) {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const monthParam = month === ALL_IMPORTED_MONTHS ? 'all' : month;

  return useQuery({
    queryKey: ['admin-imported-sales', monthParam],
    queryFn: () => fetchImportedSales(monthParam),
    enabled: !authLoading && isAdmin,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('migración')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useImportVentasExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: Array<{ fileBase64: string; filename: string }>) =>
      apiFetch<VentasImportResult>('/api/sales-reports/admin/import-ventas', {
        method: 'POST',
        body: JSON.stringify({ files }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-imported-sales'] });
    },
  });
}
