import { useQuery } from '@tanstack/react-query';

import type { IntegrationsHealthResponse } from '@/types/integrations-health';

async function fetchIntegrationsHealth(): Promise<IntegrationsHealthResponse> {
  const response = await fetch('/api/integrations/health');
  if (!response.ok) {
    throw new Error('No se pudo comprobar las integraciones');
  }
  return response.json() as Promise<IntegrationsHealthResponse>;
}

export function useIntegrationsHealth() {
  return useQuery({
    queryKey: ['integrations-health'],
    queryFn: fetchIntegrationsHealth,
    staleTime: 60_000,
    retry: 1,
  });
}

export function isHaiSupportConnected(health: IntegrationsHealthResponse | undefined): boolean {
  return health?.haisupport.connected === true;
}

export function isHaiSalesConnected(health: IntegrationsHealthResponse | undefined): boolean {
  return health?.haisales.connected === true;
}
