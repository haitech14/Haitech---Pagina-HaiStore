import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import {
  cityFromBilling,
  isCompleteWhatsAppContact,
  readStoredWhatsAppContact,
  storeWhatsAppContact,
  type WhatsAppContact,
} from '@/lib/whatsapp-contact';

interface MeContactPayload {
  contact: Partial<WhatsAppContact> & { source: 'account' | 'session' | 'guest' };
}

async function fetchAccountContact(): Promise<WhatsAppContact | null> {
  try {
    const data = await apiFetch<MeContactPayload>('/api/customers/me');
    if (isCompleteWhatsAppContact(data.contact)) {
      return {
        name: data.contact.name.trim(),
        phone: data.contact.phone.trim(),
        city: data.contact.city.trim(),
      };
    }
    const partial = data.contact;
    if (partial.name?.trim() || partial.phone?.trim() || partial.city?.trim()) {
      return {
        name: partial.name?.trim() ?? '',
        phone: partial.phone?.trim() ?? '',
        city: partial.city?.trim() ?? '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function useWhatsAppContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['whatsapp-contact', user?.email ?? 'guest'],
    queryFn: async () => {
      if (user) {
        const account = await fetchAccountContact();
        if (account) return account;
        return {
          name: user.name?.trim() ?? '',
          phone: '',
          city: '',
        } satisfies WhatsAppContact;
      }
      return readStoredWhatsAppContact();
    },
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
    contact: query.data ?? null,
    isLoading: query.isLoading,
    saveContact: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
