import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { useCheckoutAccountClient } from '@/hooks/use-checkout-account-client';
import { apiFetch } from '@/lib/api';
import {
  EMPTY_PRODUCT_QUOTE_FORM,
  productQuoteFormFromCheckoutClient,
  productQuoteFormFromWhatsAppContact,
  type ProductQuoteFormValues,
  whatsAppContactFromProductQuoteForm,
} from '@/lib/generate-product-quote-from-contact';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import {
  readStoredQuoteProfile,
  storeQuoteProfile,
} from '@/lib/quote-profile-storage';
import {
  readStoredWhatsAppContact,
  storeWhatsAppContact,
} from '@/lib/whatsapp-contact';

function mergeQuoteProfile(
  ...sources: Array<Partial<ProductQuoteFormValues> | null | undefined>
): ProductQuoteFormValues {
  const merged: ProductQuoteFormValues = { ...EMPTY_PRODUCT_QUOTE_FORM };

  for (const source of sources) {
    if (!source) continue;
    if (!merged.ruc && source.ruc?.trim()) merged.ruc = source.ruc.trim();
    if (!merged.razonSocial && source.razonSocial?.trim()) {
      merged.razonSocial = source.razonSocial.trim();
    }
    if (!merged.atencion && source.atencion?.trim()) merged.atencion = source.atencion.trim();
    if (!merged.celular && source.celular?.trim()) merged.celular = source.celular.trim();
    if (!merged.direccion && source.direccion?.trim()) merged.direccion = source.direccion.trim();
    if (!merged.ciudad && source.ciudad?.trim()) merged.ciudad = source.ciudad.trim();
  }

  return merged;
}

export function useQuoteProfile() {
  const { user, authProvider } = useAuth();
  const queryClient = useQueryClient();
  const { accountClient, isLoading: accountLoading } = useCheckoutAccountClient(Boolean(user));

  const profile = useMemo(() => {
    const stored = readStoredQuoteProfile();
    const whatsapp = readStoredWhatsAppContact();
    const fromWhatsapp = whatsapp ? productQuoteFormFromWhatsAppContact(whatsapp) : null;
    const fromAccount = accountClient
      ? productQuoteFormFromCheckoutClient(accountClient)
      : null;

    return mergeQuoteProfile(fromAccount, stored, fromWhatsapp);
  }, [accountClient, user?.email]);

  const saveMutation = useMutation({
    mutationFn: async (form: ProductQuoteFormValues) => {
      storeQuoteProfile(form);
      storeWhatsAppContact(whatsAppContactFromProductQuoteForm(form));

      const canSyncAccount = Boolean(user?.id && authProvider === 'supabase');
      if (!canSyncAccount) return form;

      try {
        await apiFetch<{ checkoutClient: Partial<HaitechClientFormValues> }>('/api/customers/me', {
          method: 'PATCH',
          body: JSON.stringify({ quoteProfile: form }),
        });
      } catch (error) {
        console.warn('[useQuoteProfile] Perfil guardado en el dispositivo; no se sincronizó la cuenta', error);
      }

      return form;
    },
    onSuccess: () => {
      if (user?.id && authProvider === 'supabase') {
        void queryClient.invalidateQueries({ queryKey: ['checkout-account-client', user.email] });
        void queryClient.invalidateQueries({ queryKey: ['whatsapp-contact', user.email] });
      }
    },
  });

  return {
    profile,
    isLoading: accountLoading,
    saveQuoteProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
