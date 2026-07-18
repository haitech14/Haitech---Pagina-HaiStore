import { useEffect, useState } from 'react';

import {
  getCatalogMediaEpoch,
  getCatalogProductById,
  loadCatalogIndex,
  subscribeCatalogMediaUpdates,
  type CatalogRow,
} from '@/lib/catalog-featured';

type UseCatalogProductRowOptions = {
  /**
   * Si false, solo lee filas ya en memoria (no descarga inventory-index).
   * Usar en rails de home alimentados por home-bundle.
   */
  fetchIfMissing?: boolean;
};

/** Fila del índice de inventario: caché síncrona + carga async opcional si aún no está en memoria. */
export function useCatalogProductRow(
  productId: string,
  options?: UseCatalogProductRowOptions,
): CatalogRow | undefined {
  const fetchIfMissing = options?.fetchIfMissing !== false;
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    if (!fetchIfMissing) return;
    if (getCatalogProductById(productId)) return;

    let cancelled = false;
    void loadCatalogIndex().then(() => {
      if (!cancelled) setCatalogVersion((version) => version + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchIfMissing, productId]);

  useEffect(() => {
    return subscribeCatalogMediaUpdates(() => {
      setCatalogVersion(getCatalogMediaEpoch());
    });
  }, []);

  void catalogVersion;
  return getCatalogProductById(productId);
}
