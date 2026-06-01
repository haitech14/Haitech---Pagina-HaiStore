import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const ordersRouter = Router();

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

function emptySummary() {
  return {
    totalSalesUsd: 0,
    orderCount: 0,
    salesByDay: [],
    salesByCategory: [],
    topProducts: [],
  };
}
