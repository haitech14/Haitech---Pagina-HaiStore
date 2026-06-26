import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import {
  normalizeCheckoutAccountClient,
  type CheckoutAccountClientResponse,
} from '@/lib/checkout-account-client';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { apiFetch } from '@/lib/api';
import {
  companyOrRucFromCheckoutParts,
  mergeWhatsAppContactPrefill,
  readStoredWhatsAppContact,
  storeWhatsAppContact,
  type WhatsAppContact,
} from '@/lib/whatsapp-contact';

function checkoutClientToWhatsAppContact(
  client: Partial<HaitechClientFormValues> | null | undefined,
): Partial<WhatsAppContact> {
  if (!client) return {};

  const name = client.nombreContacto?.trim() || client.nombre?.trim() || '';
  const companyOrRuc = companyOrRucFromCheckoutParts(client.rucDni, client.nombre);
  const city = client.ciudad?.trim() || '';

  return {
    ...(name ? { name } : {}),
    ...(companyOrRuc ? { companyOrRuc } : {}),
    ...(city ? { city } : {}),
  };
}

function sessionFallbackContact(user: {
  email?: string | null;
  name?: string | null;
}): Partial<WhatsAppContact> {
  return {
    name: user.name?.trim() ?? '',
    companyOrRuc: '',
    city: '',
  };
}

async function fetchAccountContact(): Promise<WhatsAppContact> {
  const data = await apiFetch<
    CheckoutAccountClientResponse & {
      contact?: Partial<WhatsAppContact> & { source?: string };
    }
  >('/api/customers/me');

  const fromCheckout = checkoutClientToWhatsAppContact(
    normalizeCheckoutAccountClient(data.checkoutClient),
  );

  return mergeWhatsAppContactPrefill(data.contact, fromCheckout);
}

export function useWhatsAppContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const immediateFallback = useMemo(() => {
    const stored = readStoredWhatsAppContact();
    if (user) {
      return mergeWhatsAppContactPrefill(sessionFallbackContact(user), stored);
    }
    return stored ?? { name: '', companyOrRuc: '', city: '' };
  }, [user]);

  const query = useQuery({
    queryKey: ['whatsapp-contact', user?.email ?? 'guest'],
    queryFn: async () => {
      if (user) {
        try {
          const account = await fetchAccountContact();
          return mergeWhatsAppContactPrefill(sessionFallbackContact(user), account);
        } catch {
          return immediateFallback;
        }
      }
      return readStoredWhatsAppContact() ?? { name: '', companyOrRuc: '', city: '' };
    },
    placeholderData: immediateFallback,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (contact: WhatsAppContact) => {
      storeWhatsAppContact(contact);
      if (user) {
        try {
          await apiFetch<{ contact: WhatsAppContact }>('/api/customers/me', {
            method: 'PATCH',
            body: JSON.stringify(contact),
          });
        } catch {
          /* Sin sesión API: solo local */
        }
      }
      return contact;
    },
    onSuccess: (contact) => {
      queryClient.setQueryData(['whatsapp-contact', user?.email ?? 'guest'], contact);
    },
  });

  return {
    contact: query.data ?? immediateFallback,
    isLoading: query.isLoading && !query.isPlaceholderData,
    saveContact: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
