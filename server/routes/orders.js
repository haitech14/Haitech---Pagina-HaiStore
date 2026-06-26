import { Router } from 'express';

import { requireAdmin, requireAuth } from '../lib/auth-store.js';
import { notifyHaiSupportChange } from '../lib/haisupport-sync.js';
import { saveOrderPaymentProof } from '../lib/order-payment-proof.js';
import { createStoreOrderFromBody, getStoreOrderByNumber } from '../lib/orders-store.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const ordersRouter = Router();

const MY_ORDERS_SELECT = `
  id,
  order_number,
  status,
  payment_status,
  payment_method,
  payment_provider,
  payment_metadata,
  currency,
  subtotal_usd,
  total_usd,
  total_pen,
  exchange_rate,
  shipping_address,
  billing_address,
  created_at,
  paid_at,
  shipped_at,
  delivered_at,
  items:store_order_items (
    id,
    quantity,
    unit_price_usd,
    line_total_usd,
    product_snapshot
  )
`;

ordersRouter.get('/my', requireAuth, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    if (!req.user?.id) {
      return res.json({ orders: [], source: 'demo' });
    }

    const { data, error } = await supabase
      .from('store_orders')
      .select(MY_ORDERS_SELECT)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[orders] my error:', error);
      return res.status(500).json({ error: 'No se pudieron cargar tus pedidos' });
    }

    res.json({ orders: data ?? [], source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

ordersRouter.post('/my/:orderId/payment-proof', requireAuth, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const orderId = String(req.params.orderId ?? '').trim();
    if (!orderId) {
      return res.status(400).json({ error: 'Pedido no válido' });
    }

    const { data: order, error: readError } = await supabase
      .from('store_orders')
      .select('id, user_id, payment_metadata, payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (readError || !order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (!req.user?.id || order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para adjuntar este comprobante' });
    }

    const proof = await saveOrderPaymentProof(orderId, req.body?.dataUrl, req.body?.fileName);
    const existingMetadata =
      order.payment_metadata && typeof order.payment_metadata === 'object'
        ? order.payment_metadata
        : {};

    const paymentMetadata = {
      ...existingMetadata,
      payment_proof_url: proof.url,
      payment_proof_file_name: proof.fileName,
      payment_proof_uploaded_at: proof.uploadedAt,
      payment_proof_mime_type: proof.mimeType,
    };

    const { error: updateError } = await supabase
      .from('store_orders')
      .update({
        payment_metadata: paymentMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[orders] payment-proof update:', updateError.message);
      return res.status(500).json({ error: 'No se pudo guardar el comprobante' });
    }

    notifyHaiSupportChange('orders', 'update', {
      id: orderId,
      payment_metadata: paymentMetadata,
    });

    res.json({
      ok: true,
      payment_proof_url: proof.url,
      payment_proof_file_name: proof.fileName,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Formato') ||
        error.message.includes('Solo se permiten') ||
        error.message.includes('no puede superar')
      ) {
        return res.status(400).json({ error: error.message });
      }
    }
    next(error);
  }
});

ordersRouter.get('/status/:orderNumber', async (req, res, next) => {
  try {
    const orderNumber = decodeURIComponent(req.params.orderNumber ?? '').trim();
    if (!orderNumber) {
      return res.status(400).json({ error: 'Número de pedido requerido' });
    }

    const order = await getStoreOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      order: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        payment_provider: order.payment_provider,
        total_usd: order.total_usd,
        total_pen: order.total_pen,
        currency: order.currency,
      },
    });
  } catch (error) {
    next(error);
  }
});

function parseDateParam(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inRange(isoDate, from, to) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function dayKey(isoDate) {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 10);
}

const ORDER_DETAIL_SELECT = `
  id,
  order_number,
  customer_id,
  user_id,
  status,
  payment_status,
  payment_method,
  currency,
  subtotal_usd,
  tax_usd,
  total_usd,
  total_pen,
  exchange_rate,
  shipping_address,
  billing_address,
  notes,
  paid_at,
  shipped_at,
  delivered_at,
  cancelled_at,
  created_at,
  updated_at,
  customer:store_customers (
    id,
    email,
    full_name,
    company_name,
    phone,
    tax_id
  ),
  items:store_order_items (
    id,
    product_id,
    quantity,
    unit_price_usd,
    line_total_usd,
    product_snapshot
  )
`;

ordersRouter.get('/admin/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({
        orders: [],
        summary: emptySummary(),
        source: 'unavailable',
      });
    }

    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    const { data: orders, error: ordersError } = await supabase
      .from('store_orders')
      .select(
        `
        id,
        order_number,
        customer_id,
        user_id,
        status,
        payment_status,
        payment_method,
        currency,
        subtotal_usd,
        tax_usd,
        total_usd,
        total_pen,
        exchange_rate,
        created_at,
        updated_at,
        customer:store_customers (
          id,
          email,
          full_name,
          company_name
        ),
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
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[orders] list error:', ordersError);
      return res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
    }

    const allOrders = orders ?? [];
    const paidOrders = allOrders.filter(
      (order) => order.payment_status === 'paid' && order.status !== 'cancelled',
    );

    const rangedPaid = paidOrders.filter((order) => inRange(order.created_at, from, to));

    const salesByDayMap = new Map();
    for (const order of rangedPaid) {
      const key = dayKey(order.created_at);
      salesByDayMap.set(key, (salesByDayMap.get(key) ?? 0) + Number(order.total_usd));
    }

    const salesByDay = Array.from(salesByDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sales]) => ({ date, sales }));

    const categoryTotals = new Map();
    for (const order of rangedPaid) {
      for (const item of order.items ?? []) {
        const snapshot = item.product_snapshot ?? {};
        const category =
          (typeof snapshot.category === 'string' && snapshot.category.trim()) ||
          'Sin categoría';
        const amount = Number(item.line_total_usd) || 0;
        categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + amount);
      }
    }

    const categorySum = Array.from(categoryTotals.values()).reduce((sum, n) => sum + n, 0);
    const salesByCategory = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percent: categorySum > 0 ? Math.round((amount / categorySum) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const productTotals = new Map();
    for (const order of rangedPaid) {
      for (const item of order.items ?? []) {
        const snapshot = item.product_snapshot ?? {};
        const key = item.product_id ?? snapshot.id ?? item.id;
        const name =
          (typeof snapshot.name === 'string' && snapshot.name) || item.product_id || 'Producto';
        const entry = productTotals.get(key) ?? {
          product_id: item.product_id ?? null,
          name,
          units: 0,
          revenue_usd: 0,
          image: typeof snapshot.image_url === 'string' ? snapshot.image_url : null,
        };
        entry.units += Number(item.quantity) || 0;
        entry.revenue_usd += Number(item.line_total_usd) || 0;
        productTotals.set(key, entry);
      }
    }

    const topProducts = Array.from(productTotals.values())
      .sort((a, b) => b.revenue_usd - a.revenue_usd)
      .slice(0, 5);

    const totalSalesUsd = rangedPaid.reduce((sum, order) => sum + Number(order.total_usd), 0);

    res.json({
      orders: allOrders,
      summary: {
        totalSalesUsd,
        orderCount: rangedPaid.length,
        salesByDay,
        salesByCategory,
        topProducts,
      },
      source: 'supabase',
    });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/admin/all', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({ orders: [], source: 'unavailable' });
    }

    const limit = Math.min(Number(req.query.limit) || 200, 500);

    const { data, error } = await supabase
      .from('store_orders')
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        payment_method,
        total_usd,
        total_pen,
        currency,
        created_at,
        customer:store_customers (
          email,
          full_name,
          company_name
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[orders] list error:', error);
      return res.status(500).json({ error: 'No se pudieron cargar las ventas' });
    }

    res.json({ orders: data ?? [], source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/admin/recent', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({ orders: [], source: 'unavailable' });
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const { data, error } = await supabase
      .from('store_orders')
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_usd,
        total_pen,
        currency,
        created_at,
        customer:store_customers (
          email,
          full_name,
          company_name
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[orders] recent error:', error);
      return res.status(500).json({ error: 'No se pudieron cargar pedidos recientes' });
    }

    res.json({ orders: data ?? [], source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { data, error } = await supabase
      .from('store_orders')
      .select(ORDER_DETAIL_SELECT)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      console.error('[orders] detail error:', error);
      return res.status(500).json({ error: 'No se pudo cargar la venta' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ order: data, source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

const ORDER_STATUSES = new Set([
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

const PAYMENT_STATUSES = new Set(['pending', 'paid', 'failed', 'refunded']);

function buildOrderPatch(body) {
  const patch = {};
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.has(body.status)) {
      throw new Error('Estado de pedido no válido');
    }
    patch.status = body.status;
  }
  if (body.payment_status !== undefined) {
    if (!PAYMENT_STATUSES.has(body.payment_status)) {
      throw new Error('Estado de pago no válido');
    }
    patch.payment_status = body.payment_status;
  }
  if (body.payment_method !== undefined) {
    const method =
      body.payment_method === null || body.payment_method === ''
        ? null
        : String(body.payment_method).trim().slice(0, 120);
    patch.payment_method = method;
  }
  if (body.notes !== undefined) {
    patch.notes =
      body.notes === null || body.notes === '' ? null : String(body.notes).trim().slice(0, 2000);
  }
  return patch;
}

ordersRouter.patch('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    let patch;
    try {
      patch = buildOrderPatch(req.body ?? {});
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Datos no válidos',
      });
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const { data, error } = await supabase
      .from('store_orders')
      .update(patch)
      .eq('id', req.params.id)
      .select(ORDER_DETAIL_SELECT)
      .maybeSingle();

    if (error) {
      console.error('[orders] patch error:', error);
      return res.status(500).json({ error: 'No se pudo actualizar la venta' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ order: data, source: 'supabase' });
  } catch (error) {
    next(error);
  }
});

ordersRouter.post('/checkout', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const order = await createStoreOrderFromBody({
      ...body,
      paymentProvider: body.paymentProvider ?? 'manual',
      status: 'pending_payment',
      paymentStatus: 'pending',
      deductStock: true,
      deferCouponRedemption: false,
    });
    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (message.includes('Supabase no configurado')) {
        return res.status(503).json({ error: message });
      }
      if (
        message.includes('requiere') ||
        message.includes('obligator') ||
        message.includes('No se pudo') ||
        message.includes('ítems') ||
        message.includes('producto') ||
        message.includes('Cupón') ||
        message.includes('cupón')
      ) {
        return res.status(400).json({ error: message });
      }
    }
    next(error);
  }
});

ordersRouter.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const order = await createStoreOrderFromBody(req.body ?? {});
    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof Error && error.message.includes('requiere')) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error && (error.message.includes('obligator') || error.message.includes('producto'))) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

ordersRouter.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase no configurado' });
    }

    const { error } = await supabase.from('store_orders').delete().eq('id', req.params.id);

    if (error) {
      console.error('[orders] delete error:', error);
      return res.status(500).json({ error: 'No se pudo eliminar la venta' });
    }

    notifyHaiSupportChange('orders', 'delete', { id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

function emptySummary() {
  return {
    totalSalesUsd: 0,
    orderCount: 0,
    salesByDay: [],
    salesByCategory: [],
    topProducts: [],
  };
}
