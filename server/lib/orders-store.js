import { randomUUID } from 'crypto';

import { redeemCoupon, validateCouponCode } from './coupons-store.js';
import { ensureStoreCustomerFromHaitechClient } from './haisupport-bridge.js';
import { notifyHaiSupportChange } from './haisupport-sync.js';
import { inboundPayloadToHaitechClient } from './haitech-mappers.js';
import { getSupabaseAdmin } from './supabase-auth.js';

const VALID_ORDER_STATUS = new Set([
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

const VALID_PAYMENT_STATUS = new Set(['pending', 'paid', 'failed', 'refunded']);

async function resolveKnownProductIds(supabase, lineItems) {
  const ids = [
    ...new Set(
      lineItems
        .map((line) => (typeof line.productId === 'string' ? line.productId.trim() : ''))
        .filter(Boolean),
    ),
  ];
  if (ids.length === 0) return new Set();

  const { data, error } = await supabase.from('products').select('id').in('id', ids);
  if (error) {
    console.warn('[orders-store] product lookup:', error.message);
    return new Set();
  }
  return new Set((data ?? []).map((row) => row.id));
}

export async function createStoreOrderFromBody(body) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const customer = inboundPayloadToHaitechClient(body.customer ?? {});
  const { clientId } = await ensureStoreCustomerFromHaitechClient(customer);

  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  if (lineItems.length === 0) throw new Error('Se requiere al menos un producto');

  const knownProductIds = await resolveKnownProductIds(supabase, lineItems);

  const exchangeRate = Number(body.exchangeRate) || 3.75;
  const currency = body.currency === 'PEN' ? 'PEN' : 'USD';

  let subtotalUsd = 0;
  const items = lineItems.map((line) => {
    const qty = Math.max(1, Number(line.quantity) || 1);
    const unitUsd = Math.max(0, Number(line.unitPriceUsd) || 0);
    const lineTotal = unitUsd * qty;
    subtotalUsd += lineTotal;
    const productId =
      typeof line.productId === 'string' && knownProductIds.has(line.productId.trim())
        ? line.productId.trim()
        : null;
    return {
      product_id: productId,
      quantity: qty,
      unit_price_usd: unitUsd,
      line_total_usd: lineTotal,
      product_snapshot: {
        id: line.productId ?? null,
        name: line.name,
        image_url: line.imageUrl ?? null,
      },
    };
  });

  const totalUsdBeforeDiscount = subtotalUsd;
  let discountUsd = 0;
  let couponId = null;
  let couponCode = null;
  let orderNotes = body.notes ?? null;

  const couponInput = typeof body.couponCode === 'string' ? body.couponCode.trim() : '';
  if (couponInput) {
    const couponResult = await validateCouponCode(couponInput, {
      subtotalUsd,
      exchangeRate,
      customerEmail: customer.email,
      lineItems: lineItems.map((line) => ({
        productId: line.productId,
        category: line.category ?? null,
        categorySlug: line.categorySlug ?? null,
        lineTotalUsd: Math.max(0, Number(line.unitPriceUsd) || 0) * Math.max(1, Number(line.quantity) || 1),
      })),
    });
    discountUsd = couponResult.discountUsd;
    couponId = couponResult.coupon.id;
    couponCode = couponResult.coupon.code;
    if (couponResult.freeShipping) {
      orderNotes = [orderNotes, 'Cupón: envío gratis aplicado'].filter(Boolean).join(' — ');
    }
  }

  const totalUsd = Math.max(0, Math.round((subtotalUsd - discountUsd) * 100) / 100);
  const totalPen = Math.round(totalUsd * exchangeRate * 100) / 100;

  const status = VALID_ORDER_STATUS.has(body.status) ? body.status : 'confirmed';
  const paymentStatus = VALID_PAYMENT_STATUS.has(body.paymentStatus) ? body.paymentStatus : 'paid';

  const { data: order, error: orderError } = await supabase
    .from('store_orders')
    .insert({
      customer_id: clientId,
      status,
      payment_status: paymentStatus,
      payment_method: body.paymentMethod ?? 'TPV',
      currency,
      subtotal_usd: totalUsdBeforeDiscount,
      tax_usd: 0,
      total_usd: totalUsd,
      discount_usd: discountUsd,
      coupon_id: couponId,
      coupon_code: couponCode,
      total_pen: totalPen,
      exchange_rate: exchangeRate,
      billing_address: {
        razonSocial: customer.nombre,
        documento: customer.rucDni,
        atencion: customer.nombreContacto,
        celular: customer.telefono,
        direccion: customer.direccion,
        ciudad: customer.ciudad,
      },
      notes: orderNotes,
    })
    .select('*')
    .single();

  if (orderError) {
    console.error('[orders-store] create:', orderError.message);
    throw new Error(`No se pudo crear el pedido: ${orderError.message}`);
  }

  const orderItems = items.map((item) => ({
    id: randomUUID(),
    order_id: order.id,
    ...item,
  }));

  const { error: itemsError } = await supabase.from('store_order_items').insert(orderItems);
  if (itemsError) {
    await supabase.from('store_orders').delete().eq('id', order.id);
    console.error('[orders-store] items:', itemsError.message);
    throw new Error(`No se pudieron guardar los ítems del pedido: ${itemsError.message}`);
  }

  if (couponId) {
    try {
      await redeemCoupon(couponId, order.id);
    } catch (error) {
      await supabase.from('store_order_items').delete().eq('order_id', order.id);
      await supabase.from('store_orders').delete().eq('id', order.id);
      throw error instanceof Error ? error : new Error('No se pudo canjear el cupón');
    }
  }

  const payload = {
    ...order,
    items: orderItems,
    customerSnapshot: customer,
  };

  notifyHaiSupportChange('orders', 'create', payload);

  try {
    const { applySaleStockDeduction } = await import('./inventory-stock-sale.js');
    await applySaleStockDeduction(
      lineItems.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
    );
  } catch (error) {
    console.error('[orders-store] stock deduction:', error);
  }

  return payload;
}

export async function upsertStoreOrderFromInbound(payload) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !payload?.id) return null;

  const row = {
    id: payload.id,
    order_number: payload.order_number ?? payload.orderNumber,
    customer_id: payload.customer_id ?? payload.customerId ?? null,
    status: payload.status ?? 'confirmed',
    payment_status: payload.payment_status ?? payload.paymentStatus ?? 'pending',
    payment_method: payload.payment_method ?? payload.paymentMethod ?? null,
    currency: payload.currency ?? 'USD',
    subtotal_usd: payload.subtotal_usd ?? payload.subtotalUsd ?? 0,
    tax_usd: payload.tax_usd ?? payload.taxUsd ?? 0,
    total_usd: payload.total_usd ?? payload.totalUsd ?? 0,
    total_pen: payload.total_pen ?? payload.totalPen ?? null,
    exchange_rate: payload.exchange_rate ?? payload.exchangeRate ?? null,
    notes: payload.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('store_orders').upsert(row, { onConflict: 'id' });
  if (error) throw new Error('No se pudo sincronizar pedido');

  if (Array.isArray(payload.items)) {
    await supabase.from('store_order_items').delete().eq('order_id', payload.id);
    const items = payload.items.map((item) => ({
      id: item.id ?? randomUUID(),
      order_id: payload.id,
      product_id: item.product_id ?? item.productId ?? null,
      quantity: item.quantity ?? 1,
      unit_price_usd: item.unit_price_usd ?? item.unitPriceUsd ?? 0,
      line_total_usd: item.line_total_usd ?? item.lineTotalUsd ?? 0,
      product_snapshot: item.product_snapshot ?? item.productSnapshot ?? {},
    }));
    if (items.length) await supabase.from('store_order_items').insert(items);
  }

  return row;
}

export async function deleteStoreOrderFromInbound(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !id) return;
  await supabase.from('store_order_items').delete().eq('order_id', id);
  await supabase.from('store_orders').delete().eq('id', id);
}
