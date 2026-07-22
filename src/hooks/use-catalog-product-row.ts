import { useEffect, useState } from 'react';

import {
  getCatalogMediaEpoch,
  getCatalogProductById,
  loadCatalogIndex,
  subscribeCatalogMediaUpdates,
  type CatalogRow,
} from '@/lib/catalog-featured';

type UseCatalogProductRowOptions = {
  /** Si es false, no dispara inventory-index (p. ej. cards de home con home-bundle). */
  loadIfMissing?: boolean;
};

/** Fila del índice de inventario: caché síncrona + carga async si aún no está en memoria. */
export function useCatalogProductRow(
  productId: string,
  options?: UseCatalogProductRowOptions,
): CatalogRow | undefined {
  const loadIfMissing = options?.loadIfMissing !== false;
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    if (!loadIfMissing) return;
    if (getCatalogProductById(productId)) return;

    let cancelled = false;
    void loadCatalogIndex().then(() => {
      if (!cancelled) setCatalogVersion((version) => version + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [loadIfMissing, productId]);

  useEffect(() => {
    return subscribeCatalogMediaUpdates(() => {
      setCatalogVersion(getCatalogMediaEpoch());
    });
  }, []);

  void catalogVersion;
  return getCatalogProductById(productId);
}
