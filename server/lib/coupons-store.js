import { randomBytes } from 'crypto';

import {
  getRuletaCouponPremioConfig,
  isRuletaRedeemablePremio,
} from '../../shared/ruleta-coupon-premios.js';
import { getSupabaseAdmin } from './supabase-auth.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function categoryToSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function roundUsd(value) {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function generateCouponCode(prefix = 'HS') {
  let suffix = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i += 1) {
    suffix += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return `${prefix}-${suffix}`;
}

function mapCouponRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    scope: row.scope,
    categorySlug: row.category_slug,
    premioId: row.premio_id,
    campaign: row.campaign,
    assignedEmail: row.assigned_email,
    minOrderUsd: Number(row.min_order_usd ?? 0),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    status: row.status,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    orderId: row.order_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isCouponExpired(row) {
  return new Date(row.expires_at).getTime() <= Date.now();
}

function assertCouponActive(coupon) {
  if (!coupon) throw new Error('Cupón no encontrado');
  if (coupon.status === 'cancelled') throw new Error('Este cupón fue cancelado');
  const usedCount = coupon.usedCount ?? coupon.used_count ?? 0;
  const maxUses = coupon.maxUses ?? coupon.max_uses ?? 1;
  if (coupon.status === 'used' || usedCount >= maxUses) {
    throw new Error('Este cupón ya fue utilizado');
  }
  const expiresAt = coupon.expiresAt ?? coupon.expires_at;
  if (coupon.status === 'expired' || (expiresAt && isCouponExpired({ expires_at: expiresAt }))) {
    throw new Error('Este cupón ha expirado');
  }
  if (coupon.status !== 'active') throw new Error('Cupón no disponible');
}

function resolveEligibleSubtotalUsd(coupon, lineItems) {
  const items = Array.isArray(lineItems) ? lineItems : [];
  if (coupon.scope === 'all' || coupon.scope === 'free_shipping') {
    return items.reduce((sum, line) => sum + Math.max(0, Number(line.lineTotalUsd) || 0), 0);
  }

  if (coupon.scope === 'category' && coupon.category_slug) {
    const slug = coupon.category_slug.toLowerCase();
    return items.reduce((sum, line) => {
      const lineSlug = categoryToSlug(line.categorySlug ?? line.category);
      if (lineSlug !== slug) return sum;
      return sum + Math.max(0, Number(line.lineTotalUsd) || 0);
    }, 0);
  }

  return items.reduce((sum, line) => sum + Math.max(0, Number(line.lineTotalUsd) || 0), 0);
}

function couponDiscountType(coupon) {
  return coupon.discountType ?? coupon.discount_type;
}

function couponDiscountValue(coupon) {
  return Number(coupon.discountValue ?? coupon.discount_value);
}

function couponCategorySlug(coupon) {
  return coupon.categorySlug ?? coupon.category_slug;
}

function computeDiscountUsd(coupon, context) {
  const exchangeRate = Math.max(0.0001, Number(context.exchangeRate) || 3.7);
  const subtotalUsd = Math.max(0, Number(context.subtotalUsd) || 0);
  const eligibleUsd = resolveEligibleSubtotalUsd(
    { ...coupon, category_slug: couponCategorySlug(coupon) },
    context.lineItems,
  );

  if (coupon.scope === 'free_shipping') {
    return { discountUsd: 0, eligibleUsd, freeShipping: true };
  }

  if (eligibleUsd <= 0) {
    throw new Error('Tu carrito no incluye productos elegibles para este cupón');
  }

  let discountUsd = 0;
  const discountType = couponDiscountType(coupon);
  const discountValue = couponDiscountValue(coupon);
  if (discountType === 'percent') {
    discountUsd = eligibleUsd * (discountValue / 100);
  } else if (discountType === 'fixed_usd') {
    discountUsd = discountValue;
  } else if (discountType === 'fixed_pen') {
    discountUsd = discountValue / exchangeRate;
  }

  discountUsd = roundUsd(Math.min(discountUsd, subtotalUsd, eligibleUsd));
  return { discountUsd, eligibleUsd, freeShipping: false };
}

export async function createCouponRow(input) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const codePrefix = input.codePrefix ?? 'HS';
  let code = normalizeCode(input.code);
  if (!code) {
    code = generateCouponCode(codePrefix);
  }

  const expiresAt =
    input.expiresAt ??
    new Date(Date.now() + (input.validHours ?? 72) * 60 * 60 * 1000).toISOString();

  const row = {
    code,
    label: input.label,
    description: input.description ?? null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    scope: input.scope ?? 'all',
    category_slug: input.categorySlug ?? null,
    premio_id: input.premioId ?? null,
    campaign: input.campaign ?? null,
    assigned_email: input.assignedEmail ? normalizeEmail(input.assignedEmail) : null,
    min_order_usd: Math.max(0, Number(input.minOrderUsd) || 0),
    max_uses: Math.max(1, Number(input.maxUses) || 1),
    expires_at: expiresAt,
    metadata: input.metadata ?? {},
  };

  const { data, error } = await supabase
    .from('store_discount_coupons')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      if (!input.code) {
        return createCouponRow({ ...input, code: generateCouponCode(codePrefix) });
      }
      throw new Error('Ya existe un cupón con ese código');
    }
    console.error('[coupons] create:', error.message);
    throw new Error('No se pudo crear el cupón');
  }

  return mapCouponRow(data);
}

export async function createRuletaCoupon({ premioId, email, participantName }) {
  if (!isRuletaRedeemablePremio(premioId)) {
    return null;
  }

  const config = getRuletaCouponPremioConfig(premioId);
  if (!config) return null;

  return createCouponRow({
    codePrefix: config.codePrefix,
    label: config.label,
    description: `Premio Ruleta del Color — ${config.label}`,
    discountType: config.discountType,
    discountValue: config.discountValue,
    scope: config.scope,
    categorySlug: config.categorySlug,
    premioId,
    campaign: 'ruleta-del-color',
    assignedEmail: email,
    validHours: config.validHours,
    metadata: {
      participantName: participantName ?? null,
      source: 'ruleta-del-color',
    },
  });
}

export async function findCouponByCode(code) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('store_discount_coupons')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    console.error('[coupons] lookup:', error.message);
    throw new Error('No se pudo validar el cupón');
  }

  return mapCouponRow(data);
}

export function validateCouponForCheckout(coupon, context) {
  assertCouponActive(coupon);

  const customerEmail = normalizeEmail(context.customerEmail);
  const assignedEmail = coupon.assignedEmail ?? coupon.assigned_email;
  if (assignedEmail && customerEmail && assignedEmail !== customerEmail) {
    throw new Error('Este cupón está asignado a otro correo electrónico');
  }

  const subtotalUsd = Math.max(0, Number(context.subtotalUsd) || 0);
  const minOrderUsd = Number(coupon.minOrderUsd ?? coupon.min_order_usd) || 0;
  if (subtotalUsd < minOrderUsd) {
    throw new Error(`El pedido mínimo para este cupón es USD ${minOrderUsd.toFixed(2)}`);
  }

  const { discountUsd, freeShipping } = computeDiscountUsd(coupon, context);
  const exchangeRate = Math.max(0.0001, Number(context.exchangeRate) || 3.7);

  return {
    coupon: coupon.id ? coupon : mapCouponRow(coupon),
    discountUsd,
    discountPen: roundUsd(discountUsd * exchangeRate),
    freeShipping,
    message:
      discountUsd > 0
        ? `Descuento aplicado: USD ${discountUsd.toFixed(2)}`
        : freeShipping
          ? 'Envío gratis aplicado a tu pedido'
          : 'Cupón válido',
  };
}

export async function validateCouponCode(code, context) {
  const coupon = await findCouponByCode(code);
  if (!coupon) throw new Error('Cupón no encontrado');
  return validateCouponForCheckout(coupon, context);
}

export async function redeemCoupon(couponId, orderId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const { data: current, error: readError } = await supabase
    .from('store_discount_coupons')
    .select('*')
    .eq('id', couponId)
    .maybeSingle();

  if (readError || !current) {
    throw new Error('No se pudo canjear el cupón');
  }

  const mapped = mapCouponRow(current);
  assertCouponActive(mapped);

  const nextUsed = mapped.usedCount + 1;
  const nextStatus = nextUsed >= mapped.maxUses ? 'used' : mapped.status;

  const { data, error } = await supabase
    .from('store_discount_coupons')
    .update({
      used_count: nextUsed,
      status: nextStatus,
      used_at: new Date().toISOString(),
      order_id: orderId,
    })
    .eq('id', couponId)
    .eq('status', 'active')
    .lt('used_count', current.max_uses)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    throw new Error('El cupón ya no está disponible');
  }

  return mapCouponRow(data);
}

export async function listCouponsForAdmin({ status, search, limit = 100 } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  let query = supabase
    .from('store_discount_coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(500, Math.max(1, Number(limit) || 100)));

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`code.ilike.${term},label.ilike.${term},assigned_email.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[coupons] list:', error.message);
    throw new Error('No se pudieron cargar los cupones');
  }

  return (data ?? []).map(mapCouponRow);
}

export async function cancelCoupon(couponId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase
    .from('store_discount_coupons')
    .update({ status: 'cancelled' })
    .eq('id', couponId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();

  if (error || !data) {
    throw new Error('No se pudo cancelar el cupón');
  }

  return mapCouponRow(data);
}
