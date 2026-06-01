import type { CreateProformaPayload } from '@/types/proforma';
import type { TpvCustomer, TpvLineItem } from '@/types/tpv';
import { TPV_DOCUMENT_META } from '@/types/tpv';

export function buildProformaPayloadFromTpv(
  documentNumber: string,
  customer: TpvCustomer,
  cart: TpvLineItem[],
  subtotalPen: number,
): CreateProformaPayload {
  return {
    documentNumber,
    source: 'tpv',
    documentType: 'proforma',
    customer: {
      razonSocial: customer.razonSocial.trim(),
      documento: customer.documento.trim(),
      atencion: customer.atencion.trim(),
      celular: customer.celular.trim(),
      direccion: customer.direccion,
      storeCustomerId: customer.storeCustomerId ?? null,
    },
    lineItems: cart.map((line) => ({
      productId: line.productId,
      name: line.name,
      sku: line.sku,
      brand: line.brand,
      quantity: line.quantity,
      unitPricePen: line.unitPricePen,
      imageUrl: line.imageUrl ?? null,
    })),
    currency: customer.currency,
    priceList: customer.priceList,
    subtotalPen,
    totalPen: subtotalPen,
    validityDays: TPV_DOCUMENT_META.proforma.validityDays,
  };
}

export function buildProformaPayloadFromProductQuote(
  quoteNumber: string,
  client: {
    razonSocial: string;
    ruc: string;
    atencion: string;
    celular: string;
    ciudad: string;
  },
  product: {
    id: string;
    name: string;
    sku: string;
    brand: string;
    pricePen: number;
    imageUrl?: string | null;
  },
  validityDays: number,
): CreateProformaPayload {
  return {
    documentNumber: quoteNumber,
    source: 'product',
    documentType: 'proforma',
    customer: {
      razonSocial: client.razonSocial.trim(),
      documento: client.ruc.trim(),
      atencion: client.atencion.trim(),
      celular: client.celular.trim(),
      ciudad: client.ciudad.trim(),
      direccion: client.ciudad.trim(),
    },
    lineItems: [
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        quantity: 1,
        unitPricePen: product.pricePen,
        imageUrl: product.imageUrl ?? null,
      },
    ],
    currency: 'PEN',
    subtotalPen: product.pricePen,
    totalPen: product.pricePen,
    validityDays,
  };
}
