import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { useCheckoutAccountClient } from '@/hooks/use-checkout-account-client';
import { apiFetch } from '@/lib/api';
import {
  productQuoteFormFromCheckoutClient,
  productQuoteFormFromWhatsAppContact,
  type ProductQuoteFormValues,
  whatsAppContactFromProductQuoteForm,
} from '@/lib/generate-product-quote-from-contact';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import {
  mergeQuoteForm,
  persistQuoteDraft,
  readStoredQuoteProfile,
  resolveQuoteFormOnOpen,
  storeQuoteProfile,
} from '@/lib/quote-profile-storage';
import {
  readStoredWhatsAppContact,
  storeWhatsAppContact,
} from '@/lib/whatsapp-contact';

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

    return mergeQuoteForm(stored, fromAccount, fromWhatsapp);
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
    saveQuoteDraft: persistQuoteDraft,
    resolveFormOnOpen: resolveQuoteFormOnOpen,
    isSaving: saveMutation.isPending,
  };
}
