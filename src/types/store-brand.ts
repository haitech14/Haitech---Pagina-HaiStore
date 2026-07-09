export type StoreBrandStatus = 'activa' | 'inactiva';

export interface StoreBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  logoBg?: string | null;
  logoText?: string | null;
  country: string;
  countryCode: string;
  origin: string;
  categories: string[];
  managerName: string;
  managerRole: string;
  managerAvatarColor: string;
  status: StoreBrandStatus;
  featured: boolean;
  createdAt: string;
  sortOrder: number;
}

export interface StoreBrandWithCount extends StoreBrand {
  productCount: number;
}

export interface StoreBrandsOriginDistribution {
  region: string;
  count: number;
  percent: number;
  color: string;
}

export interface StoreBrandsCategoryPresence {
  category: string;
  percent: number;
}

export interface StoreBrandsTopSeller {
  rank: number;
  name: string;
  slug: string;
  logo?: string | null;
  logoBg?: string | null;
  logoText?: string | null;
  productCount: number;
}

export interface StoreBrandsSummary {
  total: number;
  updatedAt: string;
  kpis: {
    activeCount: number;
    featuredCount: number;
    productsAssociated: number;
    countriesCount: number;
  };
  originDistribution: StoreBrandsOriginDistribution[];
  categoryPresence: StoreBrandsCategoryPresence[];
  topSellers: StoreBrandsTopSeller[];
}

export interface StoreBrandsCatalogResponse {
  brands: StoreBrandWithCount[];
  summary: StoreBrandsSummary;
}

export interface StoreBrandInput {
  name: string;
  slug?: string;
  logo?: string | null;
  logoBg?: string | null;
  logoText?: string | null;
  country: string;
  countryCode: string;
  origin: string;
  categories: string[];
  managerName: string;
  managerRole: string;
  managerAvatarColor: string;
  status: StoreBrandStatus;
  featured: boolean;
}
