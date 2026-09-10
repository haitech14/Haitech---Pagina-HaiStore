import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { isCompleteRuc, normalizeRucInput, type SunatRucResult } from '@/lib/sunat-ruc';

export function useSunatRucLookup(ruc: string) {
  const numero = normalizeRucInput(ruc);

  return useQuery({
    queryKey: ['sunat-ruc', numero],
    enabled: isCompleteRuc(numero),
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: (count, error) => {
      if (error instanceof Error && /no se encontró/i.test(error.message)) return false;
      return count < 1;
    },
    queryFn: () =>
      apiFetch<SunatRucResult>(`/api/sunat/ruc?numero=${encodeURIComponent(numero)}`),
  });
}

export function useApplySunatRuc(ruc: string, apply: (data: SunatRucResult) => void) {
  const lookup = useSunatRucLookup(ruc);
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
    if (!data) return;
    if (appliedNumeroRef.current === data.numero) return;
    appliedNumeroRef.current = data.numero;
    applyRef.current(data);
  }, [lookup.data]);

  return lookup;
}
