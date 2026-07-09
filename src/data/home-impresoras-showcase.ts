import { getHomeBestSellers } from '@/data/home-best-sellers';
import type { HomeCategoryShowcaseConfig } from '@/data/home-category-showcase';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';

const IMPRESORAS_HREF = categoryLandingPath('impresoras');

export const HOME_IMPRESORAS_SHOWCASE: HomeCategoryShowcaseConfig = {
  id: 'impresoras',
  title: 'Impresoras',
  viewAllHref: IMPRESORAS_HREF,
  viewAllLabel: 'Ver todas las impresoras',
  showcaseLayout: 'split',
  splitDensity: 'compact',
  categoryTileVariant: 'row',
  categoryGridColumns: 3,
  promoVariant: 'wide',
  promo: {
    headline: 'IMPRESORA EPSON L4360',
    priceLabel: 'A SOLO S/. 819 ONLINE',
    ctaLabel: 'COMPRAR',
    href: IMPRESORAS_HREF,
    image: '/products/epson-ecotank-l6290.webp',
    imageAlt: 'Impresora multifuncional Epson L4360',
    gradientFrom: '#312e81',
    gradientTo: '#7c3aed',
    variant: 'dark',
  },
  categories: [
    {
      id: 'impresoras-brother',
      label: 'Impresoras Brother',
      image: '/brands/brother.svg',
      href: `${IMPRESORAS_HREF}?marca=brother`,
    },
    {
      id: 'impresoras-canon',
      label: 'Impresoras Canon',
      image: '/brands/canon-160.webp',
      href: `${IMPRESORAS_HREF}?marca=canon`,
    },
    {
      id: 'impresoras-inkjet',
      label: 'Impresoras de Inyección de Tinta',
      image: '/categories/impresoras.png',
      href: IMPRESORAS_HREF,
    },
    {
      id: 'impresoras-epson',
      label: 'Impresoras Epson',
      image: '/brands/epson-160.webp',
      href: `${IMPRESORAS_HREF}?marca=epson`,
    },
    {
      id: 'impresoras-hp',
      label: 'Impresoras HP',
      image: '/brands/hp.png',
      href: `${IMPRESORAS_HREF}?marca=hp`,
    },
    {
      id: 'impresoras-laser',
      label: 'Impresoras Láser',
      image: '/categories/impresoras.png',
      href: categoryPath('impresoras', 'impresoras-laser-nuevas'),
    },
  ],
  products: getHomeBestSellers('impresoras').map((product, index) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    oldPrice: product.oldPrice,
    discountPercent: product.discountPercent,
    image: product.image,
    href: product.href,
    bestSeller: index < 4,
    category: 'Impresoras',
  })),
};
