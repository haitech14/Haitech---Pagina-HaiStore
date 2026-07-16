import { getSupabaseAdmin } from './supabase-auth.js';

const DEFAULT_PLANS = [
  { id: 'plan-5k', label: 'Plan 5,000 páginas', pages_per_month: 5000, monthly_price_pen: 499, active: true, sort_order: 1 },
  { id: 'plan-10k', label: 'Plan 10,000 páginas', pages_per_month: 10000, monthly_price_pen: 849, active: true, sort_order: 2 },
  { id: 'plan-25k', label: 'Plan 25,000 páginas', pages_per_month: 25000, monthly_price_pen: 1599, active: true, sort_order: 3 },
  { id: 'plan-50k', label: 'Plan 50,000 páginas', pages_per_month: 50000, monthly_price_pen: 3699, active: true, sort_order: 4 },
];

function rowToPlan(row) {
  return {
    id: row.id,
    label: row.label,
    pagesPerMonth: Number(row.pages_per_month) || 0,
    monthlyPricePen: Number(row.monthly_price_pen) || 0,
    active: row.active === true,
  };
}

function planToRow(plan, sortOrder = 0) {
  return {
    id: plan.id,
    label: plan.label,
    pages_per_month: plan.pagesPerMonth,
    monthly_price_pen: plan.monthlyPricePen,
    active: plan.active !== false,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export async function readRentalPlansFromSupabase({ activeOnly = false } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  let query = supabase
    .from('store_rental_plans')
    .select('id, label, pages_per_month, monthly_price_pen, active, sort_order')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    if (/relation|schema cache|Could not find/i.test(error.message)) {
      console.warn('[rental-plans] tabla no disponible; ejecuta migración 007');
      return activeOnly
        ? DEFAULT_PLANS.filter((p) => p.active).map((p) => rowToPlan(p))
        : DEFAULT_PLANS.map((p) => rowToPlan(p));
    }
    console.error('[rental-plans] supabase read:', error.message);
    throw new Error('No se pudo cargar planes de alquiler');
  }

  if (!data?.length) {
    return DEFAULT_PLANS.map((p) => rowToPlan(p));
  }

  return data.map(rowToPlan);
}

export async function writeRentalPlansToSupabase(plans) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const rows = plans.map((plan, index) => planToRow(plan, index + 1));
  const { error } = await supabase.from('store_rental_plans').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[rental-plans] supabase write:', error.message);
    throw new Error('No se pudo guardar planes de alquiler');
  }

  return plans;
}

export async function upsertRentalPlanInSupabase(plan, sortOrder = 0) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { error } = await supabase.from('store_rental_plans').upsert(planToRow(plan, sortOrder), {
    onConflict: 'id',
  });

  if (error) {
    console.error('[rental-plans] supabase upsert:', error.message);
    throw new Error('No se pudo guardar el plan de alquiler');
  }

  return plan;
}
