import { cartLineUnitUsd } from '@/context/cart-context';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { haitechFormToClient } from '@/lib/haitech-client-mappers';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import type { CartItem } from '@/types/product';

export type CheckoutPaymentProvider = 'manual' | 'culqi' | 'mercadopago';

export type ManualPaymentMethodId = 'transferencia' | 'yape-plin' | 'contra-entrega';

const MANUAL_LABELS: Record<ManualPaymentMethodId, string> = {
  transferencia: 'Transferencia bancaria / depósito',
  'yape-plin': 'Yape / Plin',
  'contra-entrega': 'Pago contra entrega (Lima)',
};

export function manualPaymentLabel(method: ManualPaymentMethodId): string {
  return MANUAL_LABELS[method];
}

export function buildCheckoutSessionPayload(
  items: CartItem[],
  client: HaitechClientFormValues,
  paymentProvider: CheckoutPaymentProvider,
  manualMethod: ManualPaymentMethodId | null,
  currency: 'USD' | 'PEN',
  couponCode?: string | null,
) {
  const customer = haitechFormToClient(client);
  const paymentMethod =
    paymentProvider === 'manual' && manualMethod
      ? manualPaymentLabel(manualMethod)
      : paymentProvider === 'culqi'
        ? 'Tarjeta de crédito/débito (recargo 5%)'
        : paymentProvider === 'mercadopago'
          ? 'Mercado Pago'
          : 'Checkout web';

  return {
    customer,
    lineItems: items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPriceUsd: cartLineUnitUsd(item),
      imageUrl: item.product.image_url ?? null,
      category: item.product.category,
    })),
    currency,
    paymentMethod,
    paymentProvider,
    exchangeRate: getUsdToPenSaleRate(),
    notes: 'Pedido web — checkout',
    couponCode: couponCode?.trim() || null,
  };
}
