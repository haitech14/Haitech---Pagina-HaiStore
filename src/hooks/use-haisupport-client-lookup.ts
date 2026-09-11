import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { isCompleteRuc, normalizeRucInput } from '@/lib/sunat-ruc';
import {
  fetchHaiSupportVisitClient,
  type HaiSupportClientLookup,
} from '@/lib/haisupport-visit';

export function useHaiSupportClientLookup(ruc: string) {
  const numero = normalizeRucInput(ruc);

  return useQuery({
    queryKey: ['haisupport-visit-client', numero],
    enabled: isCompleteRuc(numero),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: () => fetchHaiSupportVisitClient(numero),
  });
}

export function useApplyHaiSupportClient(
  ruc: string,
  apply: (data: HaiSupportClientLookup) => void,
) {
  const lookup = useHaiSupportClientLookup(ruc);
  const appliedNumeroRef = useRef<string | null>(null);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    if (!isCompleteRuc(ruc)) {
      appliedNumeroRef.current = null;
    }
  }, [ruc]);

  useEffect(() => {
    const data = lookup.data;
    if (!data?.found || !data.client) return;
    const numero = normalizeRucInput(ruc);
    if (appliedNumeroRef.current === numero) return;
    appliedNumeroRef.current = numero;
    applyRef.current(data);
  }, [lookup.data, ruc]);

  return lookup;
}
