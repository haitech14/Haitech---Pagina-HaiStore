import { cartLineUnitUsd } from '@/context/cart-context';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { normalizePdfProductCode } from '@/lib/pdf-product-code';
import { resolveProductHeroCode } from '@/lib/product-hero-meta';
import {
  buildStoreOrderPdf,
  downloadStoreOrderPdf,
  type StoreOrderPdfInput,
  type StoreOrderPdfLine,
} from '@/lib/generate-store-order-pdf';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import {
  formatShippingAddress,
  mapStoreOrderStatusToUi,
  orderTrackingMessage,
} from '@/lib/map-store-order-ui';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { orderStateLabel } from '@/components/account/order-status-steps';
import type { CheckoutSessionOrder } from '@/types/checkout';
import type { CartItem } from '@/types/product';
import type { StoreOrder } from '@/types/store';
import type { CompanySettings } from '@/types/company-settings';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de confirmación',
  paid: 'Pagado',
  failed: 'Pago fallido',
  refunded: 'Reembolsado',
};

function penFromUsd(usd: number, exchangeRate?: number | null): number {
  const rate = exchangeRate && exchangeRate > 0 ? exchangeRate : getUsdToPenSaleRate();
  return Math.round(usd * rate * 100) / 100;
}

function mapCartLines(items: CartItem[]): StoreOrderPdfLine[] {
  const rate = getUsdToPenSaleRate();
  return items.map((item) => ({
    name: item.product.name,
    sku:
      resolveProductHeroCode(item.product) ??
      normalizePdfProductCode(item.product.code?.trim() || item.product.id, item.product.brand),
    quantity: item.quantity,
    unitPricePen: Math.round(cartLineUnitUsd(item) * rate * 100) / 100,
    imageUrl: item.product.image_url,
  }));
}

export function buildOrderPdfInputFromCheckout(
  order: CheckoutSessionOrder,
  items: CartItem[],
  client: HaitechClientFormValues,
  totalPen: number,
  paymentMethod: string,
): StoreOrderPdfInput {
  return {
    orderNumber: order.order_number,
    issueDate: new Date(),
    client: {
      razonSocial: client.nombre.trim(),
      ruc: client.rucDni.trim(),
      atencion: client.nombreContacto.trim(),
      celular: client.telefono.trim(),
      direccion: client.direccion.trim(),
      ciudad: client.ciudad.trim(),
      ...(client.email?.trim() ? { email: client.email.trim() } : {}),
    },
    lines: mapCartLines(items),
    totalPen: order.total_pen ?? totalPen,
    paymentMethod,
    paymentStatusLabel:
      PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status,
    orderStatusLabel: orderStateLabel[mapStoreOrderStatusToUi(order.status as StoreOrder['status'])] ?? 'Confirmado',
    trackingMessage: order.payment_status === 'paid'
      ? 'Pago confirmado. Prepararemos su pedido a la brevedad.'
      : 'Pendiente de confirmación de pago.',
  };
}

export function buildOrderPdfInputFromStoreOrder(order: StoreOrder): StoreOrderPdfInput {
  const addr = (order.shipping_address ?? order.billing_address) as Record<string, unknown> | null;
  const lines: StoreOrderPdfLine[] = (order.items ?? []).map((item) => ({
    name: item.product_snapshot?.name ?? 'Producto',
    sku:
      (typeof item.product_snapshot?.id === 'string' && item.product_snapshot.id) ||
      item.product_id ||
      '—',
    quantity: item.quantity,
    unitPricePen: penFromUsd(Number(item.unit_price_usd), order.exchange_rate),
  }));

  const totalPen =
    order.total_pen ??
    penFromUsd(Number(order.total_usd), order.exchange_rate);

  return {
    orderNumber: order.order_number,
    issueDate: new Date(order.created_at),
    client: {
      razonSocial:
        (typeof addr?.nombre === 'string' && addr.nombre) ||
        order.customer?.company_name?.trim() ||
        order.customer?.full_name?.trim() ||
        'Cliente',
      ruc:
        (typeof addr?.rucDni === 'string' && addr.rucDni) ||
        order.customer?.tax_id?.trim() ||
        '—',
      atencion:
        (typeof addr?.atencion === 'string' && addr.atencion) ||
        (typeof addr?.nombreContacto === 'string' && addr.nombreContacto) ||
        order.customer?.full_name?.trim() ||
        '—',
      celular:
        (typeof addr?.telefono === 'string' && addr.telefono) ||
        order.customer?.phone?.trim() ||
        '—',
      direccion:
        (typeof addr?.direccion === 'string' && addr.direccion) ||
        formatShippingAddress(order).split(',')[0] ||
        '—',
      ciudad: (typeof addr?.ciudad === 'string' && addr.ciudad) || 'Lima',
      ...(order.customer?.email ? { email: order.customer.email } : {}),
    },
    lines,
    totalPen,
    paymentMethod: order.payment_method ?? '—',
    paymentStatusLabel:
      PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status,
    orderStatusLabel:
      orderStateLabel[mapStoreOrderStatusToUi(order.status)] ?? 'Confirmado',
    trackingMessage: orderTrackingMessage(order),
  };
}

export async function createStoreOrderPdfPreview(
  input: StoreOrderPdfInput,
  company: CompanySettings,
): Promise<QuotePdfPreview> {
  const generated = await buildStoreOrderPdf(input, company);
  return {
    url: URL.createObjectURL(generated.blob),
    filename: generated.filename,
    blob: generated.blob,
    quoteNumber: generated.orderNumber,
  };
}

export async function generateStoreOrderPdfPreviewFromOrder(
  order: StoreOrder,
  company: CompanySettings,
): Promise<QuotePdfPreview> {
  return createStoreOrderPdfPreview(buildOrderPdfInputFromStoreOrder(order), company);
}

export { downloadStoreOrderPdf, type StoreOrderPdfInput };
