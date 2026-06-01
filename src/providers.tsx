import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from 'sonner';

import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';
import { ExchangeRateSync } from '@/context/exchange-rate-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ExchangeRateSync />
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster richColors closeButton position="top-center" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
