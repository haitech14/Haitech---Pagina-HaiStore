import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  cancelCoupon,
  createCouponRow,
  createRuletaCoupon,
  listCouponsForAdmin,
  validateCouponCode,
} from '../lib/coupons-store.js';

export const couponsRouter = Router();

couponsRouter.post('/validate', async (req, res, next) => {
  try {
    const code = req.body?.code;
    if (!code?.trim()) {
      return res.status(400).json({ error: 'Ingresa un código de cupón' });
    }

    const result = await validateCouponCode(code, {
      subtotalUsd: req.body?.subtotalUsd,
      exchangeRate: req.body?.exchangeRate,
      customerEmail: req.body?.customerEmail,
      lineItems: req.body?.lineItems,
    });

    res.json({ valid: true, ...result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ valid: false, error: error.message });
    }
    next(error);
  }
});

couponsRouter.post('/ruleta', async (req, res, next) => {
  try {
    const premioId = req.body?.premioId;
    const email = req.body?.email;
    if (!premioId || !email) {
      return res.status(400).json({ error: 'premioId y email son obligatorios' });
    }

    const coupon = await createRuletaCoupon({
      premioId,
      email,
      participantName: req.body?.participantName,
    });

    if (!coupon) {
      return res.json({ coupon: null, redeemable: false });
    }

    res.status(201).json({ coupon, redeemable: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Supabase')) {
      return res.status(503).json({ error: error.message });
    }
    next(error);
  }
});

couponsRouter.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const coupons = await listCouponsForAdmin({
      status: typeof req.query.status === 'string' ? req.query.status : 'all',
      search: typeof req.query.search === 'string' ? req.query.search : '',
      limit: req.query.limit,
    });
    res.json({ coupons });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Supabase')) {
      return res.status(503).json({ error: error.message });
    }
    next(error);
  }
});

couponsRouter.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const coupon = await createCouponRow({
      code: body.code,
      codePrefix: body.codePrefix ?? 'HSPROM',
      label: body.label,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      scope: body.scope ?? 'all',
      categorySlug: body.categorySlug,
      campaign: body.campaign ?? 'manual',
      assignedEmail: body.assignedEmail,
      minOrderUsd: body.minOrderUsd,
      maxUses: body.maxUses,
      validHours: body.validHours ?? 168,
      metadata: body.metadata,
    });
    res.status(201).json({ coupon });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Supabase')) {
        return res.status(503).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

couponsRouter.patch('/admin/:id/cancel', requireAdmin, async (req, res, next) => {
  try {
    const coupon = await cancelCoupon(req.params.id);
    res.json({ coupon });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});
