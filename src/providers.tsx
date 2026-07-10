import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from 'sonner';

import { ServicesQuoteProvider } from '@/context/services-quote-context';
import { SoftwareQuoteProvider } from '@/context/software-quote-context';
import { AuthProvider } from '@/context/auth-context';
import { DisplayCurrencyProvider } from '@/context/display-currency-context';
import { ExchangeRateSync } from '@/context/exchange-rate-context';
import { ProductCompareProvider } from '@/context/product-compare-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { DeferredSupabaseRealtimeSync } from '@/components/deferred-supabase-realtime-sync';
import { ProductQuerySync } from '@/components/product-query-sync';

export const queryClient = new QueryClient({
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
      <DeferredSupabaseRealtimeSync />
      <ProductQuerySync />
      <ExchangeRateSync />
      <AuthProvider>
        <DisplayCurrencyProvider>
          <ServicesQuoteProvider>
          <SoftwareQuoteProvider>
          <WishlistProvider>
            <ProductCompareProvider>
              {children}
              <Toaster richColors closeButton position="top-center" />
            </ProductCompareProvider>
          </WishlistProvider>
          </SoftwareQuoteProvider>
          </ServicesQuoteProvider>
        </DisplayCurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
