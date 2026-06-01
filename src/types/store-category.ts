export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  inventoryLabels: string[];
  image?: string | null;
  tagline?: string | null;
  productCount?: number;
  children?: StoreCategory[];
}

export type StoreCategoryTreeNode = StoreCategory & { children: StoreCategoryTreeNode[] };

export interface StoreCategoryReorderItem {
  id: string;
  parentId: string | null;
  sortOrder: number;
}
