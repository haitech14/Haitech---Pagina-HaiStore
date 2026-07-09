import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { authHeaders } from '@/lib/auth-storage';
import {
  createServicePriceItem,
  deleteServicePriceItem,
  loadServicePriceList,
  updateServicePriceItem,
} from '@/lib/services-storage';
import { ensureFullPrices } from '@/lib/roles';
import type { ProductRolePrices } from '@/lib/roles';
import type {
  ServiceCatalogEstado,
  ServiceCatalogModalidad,
  ServiceCatalogTipo,
  ServicePriceItem,
} from '@/types/service';

const API_PATH = '/api/service-requests/catalog';
const IMPORT_FLAG_KEY = 'haistore-service-catalog-imported';

export interface ServiceCatalogQueryResult {
  items: ServicePriceItem[];
  unavailable: boolean;
  migrationHint?: string;
  fromLocal?: boolean;
}

export type ServiceCatalogPatch = Partial<
  Pick<
    ServicePriceItem,
    | 'code'
    | 'name'
    | 'categoryId'
    | 'description'
    | 'active'
    | 'modalidad'
    | 'cobertura'
    | 'tipo'
    | 'estado'
    | 'responsableName'
    | 'responsableTitle'
    | 'createdAt'
  > & {
    prices?: Partial<ProductRolePrices>;
  }
>;

export interface CreateServiceCatalogInput {
  name: string;
  categoryId: string;
  code?: string;
  description?: string;
  modalidad?: ServiceCatalogModalidad;
  tipo?: ServiceCatalogTipo;
  estado?: ServiceCatalogEstado;
  cobertura?: string;
  responsableName?: string;
  responsableTitle?: string;
  publicPrice?: number;
  prices?: Partial<ProductRolePrices>;
  active?: boolean;
}

function resolveApiUrl(path: string): string {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

async function fetchServiceCatalog(): Promise<ServiceCatalogQueryResult> {
  const headers = await authHeaders();
  const response = await fetch(resolveApiUrl(API_PATH), { headers });

  if (response.status === 503) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      items?: ServicePriceItem[];
    };
    return {
      items: loadServicePriceList(),
      unavailable: true,
      ...(body.error ? { migrationHint: body.error } : {}),
      fromLocal: true,
    };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo cargar el catálogo de servicios');
  }

  const body = (await response.json()) as { items: ServicePriceItem[] };
  return {
    items: body.items ?? [],
    unavailable: false,
  };
}

function localCreate(input: CreateServiceCatalogInput): ServicePriceItem {
  const next = createServicePriceItem(input.categoryId, input.name);
  const created = next[0];
  if (!created) throw new Error('No se pudo crear el servicio');

  const patch: ServiceCatalogPatch = {
    estado: input.estado ?? 'activo',
  };
  if (input.modalidad !== undefined) patch.modalidad = input.modalidad;
  if (input.tipo !== undefined) patch.tipo = input.tipo;
  if (input.cobertura !== undefined) patch.cobertura = input.cobertura;
  if (input.responsableName !== undefined) patch.responsableName = input.responsableName;
  if (input.responsableTitle !== undefined) patch.responsableTitle = input.responsableTitle;
  if (input.description !== undefined) patch.description = input.description;
  if (input.prices !== undefined) {
    patch.prices = input.prices;
  } else if (input.publicPrice !== undefined) {
    patch.prices = { public: input.publicPrice };
  }

  const updated = updateServicePriceItem(created.id, patch);
  return updated.find((item) => item.id === created.id) ?? created;
}

function localUpdate(id: string, patch: ServiceCatalogPatch): ServicePriceItem {
  const next = updateServicePriceItem(id, patch);
  const updated = next.find((item) => item.id === id);
  if (!updated) throw new Error('Servicio no encontrado');
  return updated;
}

export function useServiceCatalog() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const importAttemptedRef = useRef(false);

  const query = useQuery({
    queryKey: ['service-catalog'],
    queryFn: fetchServiceCatalog,
    enabled: isAdmin,
    select: (data) => data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
  };

  const importCatalog = useMutation({
    mutationFn: (items: ServicePriceItem[]) =>
      apiFetch<{ items: ServicePriceItem[]; imported: number }>(`${API_PATH}/import`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      sessionStorage.setItem(IMPORT_FLAG_KEY, '1');
      invalidate();
    },
  });

  useEffect(() => {
    if (!query.data || query.data.unavailable || query.data.items.length > 0) return;
    if (importAttemptedRef.current) return;
    if (sessionStorage.getItem(IMPORT_FLAG_KEY)) return;

    const localItems = loadServicePriceList();
    const hasLocalOnly =
      localItems.length > 0 &&
      localItems.some((item) => item.id && !item.id.startsWith('sp-fallback'));

    if (!hasLocalOnly) return;

    importAttemptedRef.current = true;
    void importCatalog.mutate(localItems);
  }, [query.data, importCatalog]);

  const createItem = useMutation({
    mutationFn: async (input: CreateServiceCatalogInput) => {
      if (query.data?.unavailable) {
        return localCreate(input);
      }

      const payload: Record<string, unknown> = {
        name: input.name,
        categoryId: input.categoryId,
        description: input.description ?? '',
        active: input.active ?? true,
        estado: input.estado ?? 'activo',
        prices: ensureFullPrices({
          ...(input.prices ?? {}),
          ...(input.publicPrice !== undefined ? { public: input.publicPrice } : {}),
        }),
      };
      if (input.code) payload.code = input.code;
      if (input.modalidad) payload.modalidad = input.modalidad;
      if (input.tipo) payload.tipo = input.tipo;
      if (input.cobertura) payload.cobertura = input.cobertura;
      if (input.responsableName) payload.responsableName = input.responsableName;
      if (input.responsableTitle) payload.responsableTitle = input.responsableTitle;

      const result = await apiFetch<{ item: ServicePriceItem }>(API_PATH, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return result.item;
    },
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: ServiceCatalogPatch }) => {
      if (query.data?.unavailable) {
        return localUpdate(id, patch);
      }

      const result = await apiFetch<{ item: ServicePriceItem }>(`${API_PATH}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return result.item;
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      if (query.data?.unavailable) {
        deleteServicePriceItem(id);
        return;
      }

      await apiFetch<{ ok: boolean }>(`${API_PATH}/${id}`, { method: 'DELETE' });
    },
    onSuccess: invalidate,
  });

  const items = query.data?.items ?? [];
  const unavailable = query.data?.unavailable ?? false;
  const migrationHint = query.data?.migrationHint;

  return {
    items,
    unavailable,
    migrationHint,
    fromLocal: query.data?.fromLocal ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createItem,
    updateItem,
    deleteItem,
    importCatalog,
  };
}
