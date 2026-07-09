import { getHomeBestSellers } from '@/data/home-best-sellers';
import type { HomeCategoryShowcaseConfig } from '@/data/home-category-showcase';
import { categoryLandingPath } from '@/lib/category-path';

const LAPTOPS_CATEGORY_HREF = categoryLandingPath('computadoras-laptop');

export const HOME_LAPTOPS_SHOWCASE: HomeCategoryShowcaseConfig = {
  id: 'laptops',
  title: 'Laptops y computadoras',
  viewAllHref: LAPTOPS_CATEGORY_HREF,
  viewAllLabel: 'Ver todas las laptops',
  showcaseLayout: 'split',
  splitDensity: 'compact',
  categoryTileVariant: 'row',
  categoryGridColumns: 2,
  promo: {
    eyebrow: 'Productividad y rendimiento',
    headline: 'Laptops para trabajo y estudio',
    subheadline: 'Equipos HP, Lenovo y Dell con envío a todo el Perú',
    ctaLabel: 'COMPRAR',
    href: LAPTOPS_CATEGORY_HREF,
    image: '/products/laptop-hp-probook-450-g10.webp',
    imageAlt: 'Laptop HP ProBook para trabajo y estudio',
    gradientFrom: '#4f46e5',
    gradientTo: '#7c3aed',
  },
  categories: [
    {
      id: 'laptops-oficina',
      label: 'Laptops para Oficina',
      image: '/products/laptop-hp-probook-450-g10.webp',
      imageAlt: 'Laptops para oficina',
      href: LAPTOPS_CATEGORY_HREF,
    },
    {
      id: 'laptops-gaming',
      label: 'Laptops Gaming',
      image: '/products/laptop-dell-precision-3490-u7.webp',
      imageAlt: 'Laptops gaming de alto rendimiento',
      href: LAPTOPS_CATEGORY_HREF,
    },
    {
      id: 'laptops-hp',
      label: 'Laptops HP',
      image: '/products/laptop-hp-probook-450-g10.webp',
      imageAlt: 'Laptops HP ProBook',
      href: '/tienda?marca=hp',
    },
    {
      id: 'laptops-lenovo',
      label: 'Laptops Lenovo',
      image: '/products/laptop-lenovo-tp-t16-g3.webp',
      imageAlt: 'Laptops Lenovo ThinkPad',
      href: '/tienda?marca=lenovo',
    },
    {
      id: 'laptops-dell',
      label: 'Laptops Dell',
      image: '/products/laptop-dell-latitude-3440-i5.webp',
      imageAlt: 'Laptops Dell Latitude',
      href: '/tienda?marca=dell',
    },
    {
      id: 'computadoras-escritorio',
      label: 'Computadoras de escritorio',
      image: '/products/laptop-lenovo-m70q-g5-i5.webp',
      imageAlt: 'Computadoras de escritorio Lenovo ThinkCentre',
      href: LAPTOPS_CATEGORY_HREF,
    },
  ],
  products: getHomeBestSellers('laptops').map((product, index) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    oldPrice: product.oldPrice,
    discountPercent: product.discountPercent,
    image: product.image,
    href: product.href,
    bestSeller: index === 0,
    category: 'Laptops',
  })),
};
