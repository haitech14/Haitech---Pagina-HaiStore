import { buildShipmentCopyFromForm } from '@/lib/shipment-copy-message';
import {
  createEmptyLineItem,
  emptyShipmentForm,
  parseLineItems,
  type ShipmentFormState,
} from '@/lib/shipment-form';

export interface HaibotShippingFormValues {
  razonSocial: string;
  taxId: string;
  destination: string;
  address: string;
  attention: string;
  customerPhone: string;
  customerDni: string;
  agencyDetail: string;
  productDescription: string;
  unitPriceUsd: string;
  quantity: string;
}

export function emptyHaibotShippingForm(): HaibotShippingFormValues {
  return {
    razonSocial: '',
    taxId: '',
    destination: '',
    address: '',
    attention: '',
    customerPhone: '',
    customerDni: '',
    agencyDetail: 'A Domicilio',
    productDescription: '',
    unitPriceUsd: '',
    quantity: '1',
  };
}

export function validateHaibotShippingForm(form: HaibotShippingFormValues): string | null {
  if (!form.razonSocial.trim()) return 'Indica la razón social del cliente.';
  if (!form.destination.trim()) return 'Indica el destino de entrega.';
  if (!form.productDescription.trim()) return 'Indica al menos un producto.';
  const price = Number(form.unitPriceUsd);
  if (!price || price <= 0) return 'Indica el precio unitario en USD.';
  return null;
}

export function haibotShippingFormToShipmentState(form: HaibotShippingFormValues): ShipmentFormState {
  const base = emptyShipmentForm();
  const lineItem = createEmptyLineItem();
  lineItem.description = form.productDescription.trim();
  lineItem.unitPriceUsd = form.unitPriceUsd.trim();
  lineItem.quantity = form.quantity.trim() || '1';

  return {
    ...base,
    razonSocial: form.razonSocial.trim(),
    taxId: form.taxId.trim(),
    destination: form.destination.trim(),
    district: form.destination.trim(),
    address: form.address.trim(),
    attention: form.attention.trim(),
    customerPhone: form.customerPhone.trim(),
    customerDni: form.customerDni.trim(),
    agencyDetail: form.agencyDetail.trim() || 'A Domicilio',
    lineItems: [lineItem],
  };
}

export function buildHaibotShippingOrderMessage(form: HaibotShippingFormValues): string {
  const shipmentState = haibotShippingFormToShipmentState(form);
  const agencyDisplay = shipmentState.agencyDetail.trim() || 'Haitech';
  const copy = buildShipmentCopyFromForm(shipmentState, agencyDisplay);
  const ref = shipmentState.orderRef.trim();

  return [`📦 *Orden de envío ${ref}*`, '', copy].join('\n');
}

export function haibotShippingLineItems(form: HaibotShippingFormValues) {
  const state = haibotShippingFormToShipmentState(form);
  return parseLineItems(state.lineItems);
}
