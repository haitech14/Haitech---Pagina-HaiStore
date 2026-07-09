export type AdminMarcaStatus = 'activa' | 'inactiva';

export interface AdminMarcaManager {
  name: string;
  role: string;
  avatarColor: string;
}

export interface AdminMarcaRecord {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  logoBg?: string;
  logoText?: string;
  country: string;
  countryCode: string;
  categories: string[];
  extraCategories?: number;
  productCount: number;
  manager: AdminMarcaManager;
  status: AdminMarcaStatus;
  origin: string;
  createdAt: Date;
  featured?: boolean;
}

export interface AdminMarcaKpi {
  title: string;
  value: string;
  delta: number;
  trendLabel: string;
  icon: 'active' | 'featured' | 'products' | 'new';
  sparkline: number[];
}

export interface AdminMarcaOriginDistribution {
  region: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminMarcaCategoryPresence {
  category: string;
  percent: number;
}

export interface AdminMarcaTopSeller {
  rank: number;
  name: string;
  slug: string;
  logoBg?: string;
  logoText?: string;
  salesAmount?: number;
  productCount?: number;
}
