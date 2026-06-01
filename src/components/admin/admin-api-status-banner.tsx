import { useQuery } from '@tanstack/react-query';

export function AdminApiStatusBanner() {
  const { isError, isLoading, isFetching } = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const response = await fetch('/api/health', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<{ status: string }>;
    },
    retry: 1,
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  if (isLoading || isFetching || !isError) return null;

  return (
    <div
      role="alert"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 sm:px-6"
    >
      <strong className="font-medium">API no disponible.</strong>{' '}
      El panel necesita el servidor en el puerto 3080. En la raíz del proyecto ejecuta{' '}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">npm run dev:all</code> o, en
      otra terminal, <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">npm run server</code>
      .
    </div>
  );
}
