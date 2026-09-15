import { Router } from 'express';

import { optionalAuth } from '../lib/auth-store.js';
import { createCulqiCharge, getCulqiPublicKey, isCulqiConfigured } from '../lib/payments/culqi.js';
import {
  confirmOrderPaid,
  markOrderPaymentFailed,
} from '../lib/payments/confirm-order-paid.js';
import {
  createMercadoPagoPreference,
  getMercadoPagoPayment,
  isMercadoPagoConfigured,
} from '../lib/payments/mercadopago.js';
import {
  createStoreOrderFromBody,
  getStoreOrderById,
} from '../lib/orders-store.js';
import { mergePaymentProofMetadata, saveOrderPaymentProof } from '../lib/order-payment-proof.js';
import { updateStoreOrderFile } from '../lib/store-orders-file-store.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const checkoutRouter = Router();

const VALID_PROVIDERS = new Set(['manual', 'culqi', 'mercadopago']);

function mapCheckoutError(error, res, next) {
  if (!(error instanceof Error)) return next(error);
  const message = error.message;
  if (
    message.includes('requiere') ||
    message.includes('obligator') ||
    message.includes('No se pudo') ||
    message.includes('ítems') ||
    message.includes('producto') ||
    message.includes('Cupón') ||
    message.includes('cupón') ||
    message.includes('Pedido no encontrado') ||
    message.includes('monto mínimo') ||
    message.includes('no configurado')
  ) {
    return res.status(400).json({ error: message });
  }
  return next(error);
}

function buildPaymentOptions() {
  return {
    manual: true,
    culqi: isCulqiConfigured(),
    mercadopago: isMercadoPagoConfigured(),
    culqiPublicKey: getCulqiPublicKey() || null,
  };
}

checkoutRouter.post('/session', optionalAuth, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const paymentProvider =
      typeof body.paymentProvider === 'string' ? body.paymentProvider.trim() : 'manual';

    if (!VALID_PROVIDERS.has(paymentProvider)) {
      return res.status(400).json({ error: 'Proveedor de pago no válido' });
    }

    const userId = req.user?.id ?? null;

    const order = await createStoreOrderFromBody({
      ...body,
      userId,
      paymentProvider,
      status: 'pending_payment',
      paymentStatus: 'pending',
      deferCouponRedemption: paymentProvider !== 'manual',
      deductStock: paymentProvider === 'manual',
    });

    res.status(201).json({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_provider: order.payment_provider,
        total_usd: order.total_usd,
        total_pen: order.total_pen,
        currency: order.currency,
        payment_method: order.payment_method,
      },
      paymentOptions: buildPaymentOptions(),
    });
  } catch (error) {
    mapCheckoutError(error, res, next);
  }
});

checkoutRouter.post('/culqi/charge', optionalAuth, async (req, res, next) => {
  try {
    const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim() : '';
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';

    if (!orderId || !token) {
      return res.status(400).json({ error: 'Se requiere orderId y token de Culqi' });
    }

    const order = await getStoreOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (order.payment_status === 'paid') {
      return res.json({
        order: {
          id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
        },
        alreadyPaid: true,
      });
    }

    const email =
      order.billing_address?.email ??
      order.shipping_address?.email ??
      req.body?.email ??
      'cliente@haitech.pe';

    const totalPen = Number(order.total_pen) || Number(order.total_usd) * (Number(order.exchange_rate) || 3.75);

    let charge;
    try {
      charge = await createCulqiCharge({
        amountPen: totalPen,
        email,
        token,
        orderId: order.id,
        orderNumber: order.order_number,
      });
    } catch (error) {
      await markOrderPaymentFailed(orderId, {
        provider: 'culqi',
        metadata: error instanceof Error && error.culqiResponse ? error.culqiResponse : { message: error.message },
      });
      throw error;
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('store_orders')
        .update({
          payment_intent_token: token,
          external_payment_id: charge.id ?? null,
          payment_metadata: charge,
        })
        .eq('id', orderId);
    }

    const updated = await confirmOrderPaid(orderId, {
      provider: 'culqi',
      externalPaymentId: charge.id ?? null,
      metadata: charge,
    });

    res.json({
      order: {
        id: updated.id,
        order_number: updated.order_number,
        payment_status: updated.payment_status,
        status: updated.status,
      },
    });
  } catch (error) {
    mapCheckoutError(error, res, next);
  }
});

checkoutRouter.post('/mercadopago/preference', optionalAuth, async (req, res, next) => {
  try {
    const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim() : '';
    if (!orderId) {
      return res.status(400).json({ error: 'Se requiere orderId' });
    }

    const order = await getStoreOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (order.payment_status === 'paid') {
      return res.json({
        initPoint: null,
        alreadyPaid: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
        },
      });
    }

    const items = (order.items ?? []).map((line) => {
      const unitUsd = Number(line.unit_price_usd) || 0;
      const exchangeRate = Number(order.exchange_rate) || 3.75;
      return {
        title: line.product_snapshot?.name ?? 'Producto HaiStore',
        quantity: line.quantity,
        unitPricePen: Math.round(unitUsd * exchangeRate * 100) / 100,
      };
    });

    const totalPen = Number(order.total_pen) || 0;
    const email =
      order.billing_address?.email ??
      order.shipping_address?.email ??
      req.body?.email ??
      'cliente@haitech.pe';

    const preference = await createMercadoPagoPreference({
      orderId: order.id,
      orderNumber: order.order_number,
      totalPen,
      payerEmail: email,
      payerName: order.billing_address?.atencion ?? order.billing_address?.razonSocial ?? undefined,
      items: items.length > 0 ? items : [{ title: `Pedido ${order.order_number}`, quantity: 1, unitPricePen: totalPen }],
    });

    const supabase = getSupabaseAdmin();
    if (supabase && preference.id) {
      const { error } = await supabase
        .from('store_orders')
        .update({
          payment_intent_token: preference.id,
          payment_metadata: preference,
        })
        .eq('id', orderId);
      if (error) {
        console.warn('[checkout] mercadopago supabase:', error.message);
      }
    }

    await updateStoreOrderFile(orderId, {
      payment_intent_token: preference.id ?? null,
      payment_metadata: preference,
    }).catch(() => {});

    res.json({
      preferenceId: preference.id,
      initPoint: preference.init_point ?? preference.sandbox_init_point ?? null,
      order: {
        id: order.id,
        order_number: order.order_number,
      },
    });
  } catch (error) {
    mapCheckoutError(error, res, next);
  }
});

export const webhooksRouter = Router();

webhooksRouter.post('/culqi', async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const charge = payload.data ?? payload;
    const orderId = charge?.metadata?.order_id;

    if (orderId && charge?.outcome?.type === 'venta_exitosa') {
      await confirmOrderPaid(String(orderId), {
        provider: 'culqi',
        externalPaymentId: charge.id ?? null,
        metadata: charge,
      });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

webhooksRouter.post('/mercadopago', async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const topic = payload.type ?? payload.topic;
    const paymentId = payload.data?.id ?? payload['data.id'];

    if ((topic === 'payment' || payload.action === 'payment.created') && paymentId) {
      const payment = await getMercadoPagoPayment(paymentId);
      const orderId = payment.external_reference;
      const status = payment.status;

      if (orderId && (status === 'approved' || status === 'authorized')) {
        await confirmOrderPaid(String(orderId), {
          provider: 'mercadopago',
          externalPaymentId: String(payment.id),
          metadata: payment,
        });
      } else if (orderId && (status === 'rejected' || status === 'cancelled')) {
        await markOrderPaymentFailed(String(orderId), {
          provider: 'mercadopago',
          metadata: payment,
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[webhooks/mercadopago]', error);
    res.status(200).send('OK');
  }
});

checkoutRouter.get('/payment-options', (_req, res) => {
  res.json(buildPaymentOptions());
});

checkoutRouter.post('/orders/:orderId/payment-proof', optionalAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params.orderId ?? '').trim();
    if (!orderId) {
      return res.status(400).json({ error: 'Pedido no válido' });
    }

    const order = await getStoreOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const proof = await saveOrderPaymentProof(orderId, req.body?.dataUrl, req.body?.fileName);
    const paymentMetadata = mergePaymentProofMetadata(order.payment_metadata, proof);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('store_orders')
        .update({
          payment_metadata: paymentMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) {
        console.warn('[checkout] payment-proof supabase:', error.message);
      }
    }

    await updateStoreOrderFile(orderId, { payment_metadata: paymentMetadata });

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
