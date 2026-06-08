import type { LucideIcon } from 'lucide-react';
import { BarChart3, Headphones, KeyRound, Shield } from 'lucide-react';

import { categoryPath } from '@/lib/category-path';

export type HaitechEcosystemVariant = 'support' | 'sales' | 'rent' | 'protect';

export interface HaitechEcosystemBanner {
  id: string;
  brandPrefix: string;
  brandSuffix: string;
  description: string;
  href: string;
  ctaLabel: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  variant: HaitechEcosystemVariant;
  external?: boolean;
}

export const HAITECH_ECOSYSTEM_BANNERS: readonly HaitechEcosystemBanner[] = [
  {
    id: 'haisupport',
    brandPrefix: 'HAI',
    brandSuffix: 'Support',
    description: 'Sistema de Gestión Integral de Soporte Técnico y de Alquiler',
    href: 'https://soporte.haitech.pe/',
    ctaLabel: 'Ir a HaiSupport',
    image: '/promotions/promo-hero-servicio.png',
    imageAlt: 'Técnico de soporte atendiendo equipos de impresión',
    icon: Headphones,
    variant: 'support',
    external: true,
  },
  {
    id: 'haisales',
    brandPrefix: 'HAI',
    brandSuffix: 'Sales',
    description: 'Sistema ERP, Facturación y CRM Empresarial',
    href: 'https://ventas.haitech.pe/',
    ctaLabel: 'Ir a HaiSales',
    image: '/services/alquiler/laptops.png',
    imageAlt: 'Laptop con panel de ventas y métricas empresariales',
    icon: BarChart3,
    variant: 'sales',
    external: true,
  },
  {
    id: 'hairent',
    brandPrefix: 'Alquiler',
    brandSuffix: ' de Equipos',
    description: 'Equipos de impresión y tecnología en modalidad de alquiler mensual',
    href: categoryPath('alquiler'),
    ctaLabel: 'Ver Alquiler de Equipos',
    image: '/categories/alquiler.png',
    imageAlt: 'Impresora y laptop disponibles en modalidad de alquiler',
    icon: KeyRound,
    variant: 'rent',
    external: false,
  },
  {
    id: 'haiprotect',
    brandPrefix: 'Hai',
    brandSuffix: 'Protect',
    description: 'Protección integral y garantía extendida para equipos de impresión',
    href: '/haiprotect',
    ctaLabel: 'Ir a HaiProtect',
    image: '/services/servicio-tecnico/garantia.png',
    imageAlt: 'Garantía extendida y protección de equipos Ricoh',
    icon: Shield,
    variant: 'protect',
    external: false,
  },
] as const;
