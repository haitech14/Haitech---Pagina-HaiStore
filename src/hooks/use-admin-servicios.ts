import { useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';



import { DEFAULT_SERVICE_CATEGORIES } from '@/data/services-defaults';

import {

  useServiceCatalog,

  type CreateServiceCatalogInput,

  type ServiceCatalogPatch,

} from '@/hooks/use-service-catalog';

import {

  useServiceCategories,

  useServiceRequests,

} from '@/hooks/use-service-requests';

import {

  computeServiciosCategoryDistribution,

  computeServiciosKpis,

  computeServiciosRequestUsage,

  computeServiciosTopDemand,

  listResponsableFilterOptions,

} from '@/lib/admin-servicios-stats';

import {

  mapPriceListToAdminServicios,

  mergeServiceCategories,

} from '@/lib/admin-servicios-mapper';

import { loadServiceCategories } from '@/lib/services-storage';

import type { AdminServicioRecord } from '@/types/admin-servicios';

import type {

  ServiceCatalogEstado,

  ServiceCatalogModalidad,

  ServiceCatalogTipo,

  ServiceCategory,

  ServicePriceItem,

} from '@/types/service';



export interface CreateAdminServicioInput {

  name: string;

  categoryId: string;

  modalidad: ServiceCatalogModalidad;

  tipo: ServiceCatalogTipo;

  cobertura?: string;

  publicPrice?: number;

  responsableName?: string;

  responsableTitle?: string;

}



export interface UpdateAdminServicioInput {

  name?: string;

  categoryId?: string;

  modalidad?: ServiceCatalogModalidad;

  tipo?: ServiceCatalogTipo;

  cobertura?: string;

  estado?: ServiceCatalogEstado;

  active?: boolean;

  publicPrice?: number;

  responsableName?: string;

  responsableTitle?: string;

  description?: string;

}



function toCreateInput(input: CreateAdminServicioInput): CreateServiceCatalogInput {

  const payload: CreateServiceCatalogInput = {

    name: input.name,

    categoryId: input.categoryId,

    modalidad: input.modalidad,

    tipo: input.tipo,

    cobertura: input.cobertura?.trim() || 'Nacional',

    estado: 'activo',

    publicPrice: input.publicPrice ?? 0,

  };

  const responsableName = input.responsableName?.trim();

  const responsableTitle = input.responsableTitle?.trim();

  if (responsableName) payload.responsableName = responsableName;

  if (responsableTitle) payload.responsableTitle = responsableTitle;

  return payload;

}



function toUpdatePatch(input: UpdateAdminServicioInput): ServiceCatalogPatch {

  const patch: ServiceCatalogPatch = {};



  if (input.name !== undefined) patch.name = input.name.trim();

  if (input.categoryId !== undefined) patch.categoryId = input.categoryId;

  if (input.modalidad !== undefined) patch.modalidad = input.modalidad;

  if (input.tipo !== undefined) patch.tipo = input.tipo;

  if (input.cobertura !== undefined) patch.cobertura = input.cobertura.trim();

  if (input.estado !== undefined) patch.estado = input.estado;

  if (input.active !== undefined) patch.active = input.active;

  if (input.description !== undefined) patch.description = input.description.trim();



  const responsableName = input.responsableName?.trim();

  const responsableTitle = input.responsableTitle?.trim();

  if (responsableName !== undefined) patch.responsableName = responsableName;

  if (responsableTitle !== undefined) patch.responsableTitle = responsableTitle;



  if (input.publicPrice !== undefined) {

    patch.prices = { public: input.publicPrice };

  }



  if (input.estado === 'archivado') {

    patch.active = false;

  } else if (input.estado) {

    patch.active = true;

  }



  return patch;

}



export function useAdminServicios() {

  const {

    items: priceList,

    unavailable: catalogUnavailable,

    migrationHint: catalogMigrationHint,

    isLoading: catalogLoading,

    refetch: refetchCatalog,

    createItem,

    updateItem,

    deleteItem,

  } = useServiceCatalog();



  const { data: apiCategories = [], isLoading: categoriesLoading } = useServiceCategories();

  const {

    data: requests = [],

    isLoading: requestsLoading,

    isError: requestsError,

    error: requestsErrorObject,

    refetch: refetchRequests,

  } = useServiceRequests();



  const [localCategories, setLocalCategories] = useState<ServiceCategory[]>(() =>

    loadServiceCategories(),

  );



  useEffect(() => {

    if (apiCategories.length === 0 && localCategories.length === 0) {

      setLocalCategories(DEFAULT_SERVICE_CATEGORIES);

    }

  }, [apiCategories.length, localCategories.length]);



  const categories = useMemo(

    () => mergeServiceCategories(apiCategories, localCategories),

    [apiCategories, localCategories],

  );



  const records = useMemo(

    () => mapPriceListToAdminServicios(priceList, categories, requests),

    [priceList, categories, requests],

  );



  const kpis = useMemo(

    () => computeServiciosKpis(records, requests, categories),

    [records, requests, categories],

  );



  const categoryDistribution = useMemo(

    () => computeServiciosCategoryDistribution(records),

    [records],

  );



  const requestUsage = useMemo(

    () => computeServiciosRequestUsage(records, requests),

    [records, requests],

  );



  const topDemand = useMemo(

    () => computeServiciosTopDemand(requestUsage),

    [requestUsage],

  );



  const responsableOptions = useMemo(

    () => listResponsableFilterOptions(records),

    [records],

  );



  const refresh = useCallback(async () => {

    await Promise.all([refetchCatalog(), refetchRequests()]);

  }, [refetchCatalog, refetchRequests]);



  const findPriceItem = useCallback(

    (sourceId: string): ServicePriceItem | undefined =>

      priceList.find((item) => item.id === sourceId),

    [priceList],

  );



  const createService = useCallback(

    (input: CreateAdminServicioInput) => {

      void createItem.mutateAsync(toCreateInput(input)).then(() => {

        toast.success('Servicio agregado al catálogo');

      }).catch(() => {

        toast.error('No se pudo crear el servicio');

      });

    },

    [createItem],

  );



  const updateService = useCallback(

    (sourceId: string, input: UpdateAdminServicioInput) => {

      void updateItem

        .mutateAsync({ id: sourceId, patch: toUpdatePatch(input) })

        .then(() => {

          toast.success('Servicio actualizado');

        })

        .catch(() => {

          toast.error('No se pudo actualizar el servicio');

        });

    },

    [updateItem],

  );



  const deleteService = useCallback(

    (sourceId: string) => {

      void deleteItem

        .mutateAsync(sourceId)

        .then(() => {

          toast.success('Servicio eliminado del catálogo');

        })

        .catch(() => {

          toast.error('No se pudo eliminar el servicio');

        });

    },

    [deleteItem],

  );



  const toggleArchive = useCallback(

    (record: AdminServicioRecord) => {

      const archived = record.estado === 'archivado';

      updateService(record.sourceId, {

        active: archived,

        estado: archived ? 'activo' : 'archivado',

      });

    },

    [updateService],

  );



  return {

    records,

    categories,

    requests,

    kpis,

    categoryDistribution,

    requestUsage,

    topDemand,

    responsableOptions,

    isLoading: catalogLoading || categoriesLoading || requestsLoading,

    catalogUnavailable,

    catalogMigrationHint,

    requestsError,

    requestsErrorMessage:

      requestsError && requestsErrorObject instanceof Error

        ? requestsErrorObject.message

        : requestsError

          ? 'No se pudieron cargar las solicitudes de servicio'

          : undefined,

    refresh,

    createService,

    updateService,

    deleteService,

    toggleArchive,

    findPriceItem,

    createItem,

    updateItem,

    deleteItem,

  };

}


