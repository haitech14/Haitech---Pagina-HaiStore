import type { HomeCategoryShowcaseConfig } from '@/data/home-category-showcase';
import { categoryLandingPath } from '@/lib/category-path';
import { productPath } from '@/lib/product-path';

/** Precios referenciales alineados al mockup (PEN ≈ USD × 3.7). */
const PEN_RATE = 3.7;

function usdFromPen(pen: number): number {
  return Math.round((pen / PEN_RATE) * 100) / 100;
}

function oldUsdFromDiscount(currentUsd: number, discountPercent: number): number {
  const factor = 1 - discountPercent / 100;
  if (factor <= 0) return currentUsd;
  return Math.round((currentUsd / factor) * 100) / 100;
}

export const HOME_CONSUMIBLES_SHOWCASE: HomeCategoryShowcaseConfig = {
  id: 'consumibles',
  title: 'Consumibles',
  showcaseLayout: 'split',
  splitDensity: 'compact',
  categoryTileVariant: 'row',
  categoryGridColumns: 2,
  promo: {
    eyebrow: 'Ofertas destacadas',
    headline: 'MEJORES PRECIOS EN TÓNER Y TINTAS',
    subheadline: 'Originales y compatibles con envío a todo el Perú',
    ctaLabel: 'COMPRAR',
    href: categoryLandingPath('toner-suministros'),
    image: '/categories/ChatGPT Image 2 jul 2026, 20_33_28.png',
    imageAlt: 'Tóner y tintas para impresoras',
    gradientFrom: '#1D4ED8',
    gradientTo: '#2563EB',
    variant: 'blue',
  },
  categories: [
    {
      id: 'tintas',
      label: 'Tintas',
      image: '/products/toner-408213.webp',
      href: categoryLandingPath('toner-suministros'),
    },
    {
      id: 'toners',
      label: 'Toners',
      image: '/products/toner-418480.webp',
      href: categoryLandingPath('toner-suministros'),
    },
    {
      id: 'kits-mantenimiento',
      label: 'Kits de mantenimiento',
      image: '/categories/repuestos.png',
      href: categoryLandingPath('repuestos'),
    },
    {
      id: 'cabezales',
      label: 'Cabezales',
      image: '/categories/repuestos.png',
      href: categoryLandingPath('repuestos'),
    },
    {
      id: 'cartuchos',
      label: 'Cartuchos',
      image: '/categories/toner-suministros.png',
      href: categoryLandingPath('toner-compatibles'),
    },
    {
      id: 'drum',
      label: 'Drum',
      image: '/products/toner-842831.webp',
      href: categoryLandingPath('repuestos'),
    },
  ],
  products: [
    {
      id: 'consumible-hp-78a',
      name: 'HP 78A Toner',
      brand: 'HP',
      price: usdFromPen(329),
      oldPrice: oldUsdFromDiscount(usdFromPen(329), 15),
      discountPercent: 15,
      image: '/products/toner-418480.webp',
      href: productPath('hp-toner-58a'),
      bestSeller: true,
      category: 'Toner y Suministros',
    },
    {
      id: 'consumible-hp-83a',
      name: 'HP 83A Toner',
      brand: 'HP',
      price: usdFromPen(319),
      oldPrice: oldUsdFromDiscount(usdFromPen(319), 18),
      discountPercent: 18,
      image: '/products/toner-419078.webp',
      href: categoryLandingPath('toner-suministros'),
      bestSeller: true,
      category: 'Toner y Suministros',
    },
    {
      id: 'consumible-hp-17a',
      name: 'HP 17A Toner',
      brand: 'HP',
      price: usdFromPen(329),
      oldPrice: oldUsdFromDiscount(usdFromPen(329), 51),
      discountPercent: 51,
      image: '/products/toner-408213.webp',
      href: categoryLandingPath('toner-suministros'),
      category: 'Toner y Suministros',
    },
    {
      id: 'consumible-hp-154x',
      name: 'HP 154X Toner',
      brand: 'HP',
      price: usdFromPen(95),
      oldPrice: oldUsdFromDiscount(usdFromPen(95), 76),
      discountPercent: 76,
      image: '/products/toner-842831.webp',
      href: categoryLandingPath('toner-compatibles'),
      bestSeller: true,
      category: 'Toner Compatible',
    },
    {
      id: 'consumible-canon-printhead',
      name: 'Canon Printhead Pack',
      brand: 'Canon',
      price: usdFromPen(359),
      oldPrice: oldUsdFromDiscount(usdFromPen(359), 28),
      discountPercent: 28,
      image: '/categories/repuestos.png',
      href: categoryLandingPath('repuestos'),
      category: 'Repuestos',
    },
  ],
};
