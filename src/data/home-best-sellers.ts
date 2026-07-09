export type HomeBestSellerCategoryId = 'laptops' | 'impresoras' | 'monitores';

export type HomeBestSellerProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  image: string;
  href: string;
};

export type HomeBestSellerCategory = {
  id: HomeBestSellerCategoryId;
  label: string;
};

export const HOME_BEST_SELLER_CATEGORIES: HomeBestSellerCategory[] = [
  { id: 'laptops', label: 'Laptops' },
  { id: 'impresoras', label: 'Impresoras' },
  { id: 'monitores', label: 'Monitores' },
];

const LAPTOPS: HomeBestSellerProduct[] = [
  {
    id: 'bs-laptop-lenovo-t16',
    name: 'Lenovo ThinkPad T16 Gen 3 Intel Core i7 16GB 512GB SSD',
    brand: 'Lenovo',
    price: 1299,
    oldPrice: 1499,
    discountPercent: 13,
    image: '/products/laptop-lenovo-tp-t16-g3.webp',
    href: '/tienda',
  },
  {
    id: 'bs-laptop-hp-probook',
    name: 'HP ProBook 450 G10 Intel Core i5 16GB 512GB SSD',
    brand: 'HP',
    price: 899,
    oldPrice: 1049,
    discountPercent: 14,
    image: '/products/laptop-hp-probook-450-g10.webp',
    href: '/tienda',
  },
  {
    id: 'bs-laptop-dell-latitude',
    name: 'Dell Latitude 3440 Intel Core i5 8GB 256GB SSD',
    brand: 'Dell',
    price: 749,
    oldPrice: 899,
    discountPercent: 17,
    image: '/products/laptop-dell-latitude-3440-i5.webp',
    href: '/tienda',
  },
  {
    id: 'bs-laptop-lenovo-m70q',
    name: 'Lenovo ThinkCentre M70q Gen 5 Intel Core i5 16GB 512GB SSD',
    brand: 'Lenovo',
    price: 679,
    oldPrice: 799,
    discountPercent: 15,
    image: '/products/laptop-lenovo-m70q-g5-i5.webp',
    href: '/tienda',
  },
  {
    id: 'bs-laptop-dell-precision',
    name: 'Dell Precision 3490 Intel Core Ultra 7 32GB 512GB SSD',
    brand: 'Dell',
    price: 1899,
    oldPrice: 2199,
    discountPercent: 14,
    image: '/products/laptop-dell-precision-3490-u7.webp',
    href: '/tienda',
  },
];

const IMPRESORAS: HomeBestSellerProduct[] = [
  {
    id: 'bs-printer-epson-wf',
    name: 'Epson WorkForce Pro WF-C5790 Multifuncional A4',
    brand: 'Epson',
    price: 649,
    oldPrice: 749,
    discountPercent: 13,
    image: '/products/epson-workforce-pro.webp',
    href: '/tienda',
  },
  {
    id: 'bs-printer-epson-ecotank',
    name: 'Epson EcoTank L6290 Multifuncional WiFi',
    brand: 'Epson',
    price: 399,
    oldPrice: 469,
    discountPercent: 15,
    image: '/products/epson-ecotank-l6290.webp',
    href: '/tienda',
  },
  {
    id: 'bs-printer-canon-8186',
    name: 'Canon imageRUNNER ADVANCE DX C3826i Color A3',
    brand: 'Canon',
    price: 4299,
    oldPrice: 4799,
    discountPercent: 10,
    image: '/products/canon-8186i.webp',
    href: '/tienda',
  },
  {
    id: 'bs-printer-canon-c5170',
    name: 'Canon imageRUNNER ADVANCE C5170 Color A3',
    brand: 'Canon',
    price: 3199,
    oldPrice: 3599,
    discountPercent: 11,
    image: '/products/canon-c5170-1024.webp',
    href: '/tienda',
  },
  {
    id: 'bs-printer-canon-8105',
    name: 'Canon imageRUNNER ADVANCE DX 8105i B/N A3',
    brand: 'Canon',
    price: 5499,
    oldPrice: 5999,
    discountPercent: 8,
    image: '/products/canon-8105i-1024.webp',
    href: '/tienda',
  },
];

const MONITORES: HomeBestSellerProduct[] = [
  {
    id: 'bs-monitor-teros-te2415',
    name: 'Monitor Teros TE-2415S 24" Full HD IPS',
    brand: 'Teros',
    price: 189,
    oldPrice: 229,
    discountPercent: 17,
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    href: '/tienda',
  },
  {
    id: 'bs-monitor-samsung-s3',
    name: 'Monitor Samsung S3 F330 24" Full HD',
    brand: 'Samsung',
    price: 219,
    oldPrice: 259,
    discountPercent: 15,
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    href: '/tienda',
  },
  {
    id: 'bs-monitor-samsung-ls24',
    name: 'Monitor Samsung LS24F320 24" Full HD 75Hz',
    brand: 'Samsung',
    price: 199,
    oldPrice: 239,
    discountPercent: 17,
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    href: '/tienda',
  },
  {
    id: 'bs-monitor-teros-te2714',
    name: 'Monitor Teros TE-2714S Gaming 27" 165Hz',
    brand: 'Teros',
    price: 279,
    oldPrice: 329,
    discountPercent: 15,
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    href: '/tienda',
  },
  {
    id: 'bs-monitor-lg-32mr50',
    name: 'Monitor LG 32MR50C-B Curved 32" Full HD 100Hz',
    brand: 'LG',
    price: 349,
    oldPrice: 419,
    discountPercent: 17,
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    href: '/tienda',
  },
];

export const HOME_BEST_SELLERS_BY_CATEGORY: Record<HomeBestSellerCategoryId, HomeBestSellerProduct[]> = {
  laptops: LAPTOPS,
  impresoras: IMPRESORAS,
  monitores: MONITORES,
};

export function getHomeBestSellers(categoryId: HomeBestSellerCategoryId): HomeBestSellerProduct[] {
  return HOME_BEST_SELLERS_BY_CATEGORY[categoryId];
}
