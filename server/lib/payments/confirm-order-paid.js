import { redeemCoupon } from '../coupons-store.js';
import { notifyHaiSupportChange } from '../haisupport-sync.js';
import { getSupabaseAdmin } from '../supabase-auth.js';

/**
 * Marca un pedido como pagado de forma idempotente y descuenta stock.
 * @param {string} orderId
 * @param {{ externalPaymentId?: string | null; provider?: string | null; metadata?: Record<string, unknown> | null }} options
 */
export async function confirmOrderPaid(orderId, options = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const { updateStoreOrderFile, getStoreOrderFileById } = await import('../store-orders-file-store.js');
    const existing = await getStoreOrderFileById(orderId);
    if (!existing) throw new Error('Pedido no encontrado');
    if (existing.payment_status === 'paid') return existing;
    const now = new Date().toISOString();
    return updateStoreOrderFile(orderId, {
      payment_status: 'paid',
      status: existing.status === 'pending_payment' ? 'confirmed' : existing.status,
      paid_at: now,
      ...(options.externalPaymentId ? { external_payment_id: options.externalPaymentId } : {}),
      ...(options.provider ? { payment_provider: options.provider } : {}),
      ...(options.metadata ? { payment_metadata: options.metadata } : {}),
    });
  }

  const { data: order, error: readError } = await supabase
    .from('store_orders')
    .select(
      `
      *,
      items:store_order_items (
        id,
        product_id,
        quantity,
        unit_price_usd,
        line_total_usd,
        product_snapshot
      )
    `,
    )
    .eq('id', orderId)
    .maybeSingle();

  if (readError || !order) {
    throw new Error('Pedido no encontrado');
  }

  if (order.payment_status === 'paid') {
    return order;
  }

  const now = new Date().toISOString();
  const patch = {
    payment_status: 'paid',
    status: order.status === 'pending_payment' ? 'confirmed' : order.status,
    paid_at: now,
    updated_at: now,
    ...(options.externalPaymentId ? { external_payment_id: options.externalPaymentId } : {}),
    ...(options.provider ? { payment_provider: options.provider } : {}),
    ...(options.metadata ? { payment_metadata: options.metadata } : {}),
  };

  const { data: updated, error: updateError } = await supabase
    .from('store_orders')
    .update(patch)
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`No se pudo confirmar el pago: ${updateError.message}`);
  }

  if (order.coupon_id) {
    try {
      await redeemCoupon(order.coupon_id, orderId);
    } catch (error) {
      console.error('[confirm-order-paid] coupon redeem:', error);
    }
  }

  const lineItems = (order.items ?? []).map((item) => ({
    productId: item.product_id ?? item.product_snapshot?.id,
    quantity: item.quantity,
  }));

  try {
    const { applySaleStockDeduction } = await import('../inventory-stock-sale.js');
    await applySaleStockDeduction(lineItems);
  } catch (error) {
    console.error('[confirm-order-paid] stock deduction:', error);
  }

  if (options.provider && options.metadata) {
    await supabase.from('store_payment_events').insert({
      order_id: orderId,
      provider: options.provider,
      event_type: 'payment_confirmed',
      payload: options.metadata,
    });
  }

  notifyHaiSupportChange('orders', 'update', { ...updated, items: order.items });

  return updated;
}

/**
 * @param {string} orderId
 * @param {{ provider?: string; metadata?: Record<string, unknown> }} options
 */
export async function markOrderPaymentFailed(orderId, options = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const { updateStoreOrderFile } = await import('../store-orders-file-store.js');
    return updateStoreOrderFile(orderId, {
      payment_status: 'failed',
      ...(options.metadata ? { payment_metadata: options.metadata } : {}),
    });
  }

  const { data: order, error } = await supabase
    .from('store_orders')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
      ...(options.metadata ? { payment_metadata: options.metadata } : {}),
    })
    .eq('id', orderId)
    .neq('payment_status', 'paid')
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo marcar pago fallido: ${error.message}`);
  }

  if (order && options.provider && options.metadata) {
    await supabase.from('store_payment_events').insert({
      order_id: orderId,
      provider: options.provider,
      event_type: 'payment_failed',
      payload: options.metadata,
    });
  }

  return order;
}
