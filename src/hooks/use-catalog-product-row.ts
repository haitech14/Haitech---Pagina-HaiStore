import { useEffect, useState } from 'react';

import {
  getCatalogMediaEpoch,
  getCatalogProductById,
  loadCatalogIndex,
  subscribeCatalogMediaUpdates,
  type CatalogRow,
} from '@/lib/catalog-featured';

/** Fila del índice de inventario: caché síncrona + carga async si aún no está en memoria. */
export function useCatalogProductRow(productId: string): CatalogRow | undefined {
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    if (getCatalogProductById(productId)) return;

    let cancelled = false;
    void loadCatalogIndex().then(() => {
      if (!cancelled) setCatalogVersion((version) => version + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    return subscribeCatalogMediaUpdates(() => {
      setCatalogVersion(getCatalogMediaEpoch());
    });
  }, []);

  void catalogVersion;
  return getCatalogProductById(productId);
}
