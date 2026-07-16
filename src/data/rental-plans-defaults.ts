import type { RentalPlanConfig } from '@/types/rental-plan';

export const DEFAULT_RENTAL_PLANS: RentalPlanConfig[] = [
  {
    id: 'plan-5k',
    label: 'Plan 5,000 páginas',
    pagesPerMonth: 5000,
    monthlyPricePen: 499,
    active: true,
  },
  {
    id: 'plan-10k',
    label: 'Plan 10,000 páginas',
    pagesPerMonth: 10000,
    monthlyPricePen: 849,
    active: true,
  },
  {
    id: 'plan-25k',
    label: 'Plan 25,000 páginas',
    pagesPerMonth: 25000,
    monthlyPricePen: 1599,
    active: true,
  },
  {
    id: 'plan-50k',
    label: 'Plan 50,000 páginas',
    pagesPerMonth: 50000,
    monthlyPricePen: 3699,
    active: true,
  },
];
