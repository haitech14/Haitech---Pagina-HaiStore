import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export interface OrderPaymentProofUploadResult {
  ok: boolean;
  payment_proof_url: string;
  payment_proof_file_name: string;
}

export function useUploadOrderPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, file }: { orderId: string; file: File }) => {
      const dataUrl = await readFileAsDataUrl(file);
      return apiFetch<OrderPaymentProofUploadResult>(
        `/api/orders/my/${encodeURIComponent(orderId)}/payment-proof`,
        {
          method: 'POST',
          body: JSON.stringify({
            dataUrl,
            fileName: file.name,
          }),
        },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
}
