import {
  AlignJustify,
  Copy,
  Droplets,
  FileStack,
  Laptop,
  PackageOpen,
  PenTool,
  Presentation,
  Printer,
  Receipt,
  ScanLine,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { HomeFeaturedEquipmentCategoryFilterId } from '@/data/home-featured-quick-filters-equipment';

export const HOME_EQUIPMENT_CATEGORY_ICONS: Record<HomeFeaturedEquipmentCategoryFilterId, LucideIcon> =
  {
    multifuncionales: Copy,
    'impresora-laser': Printer,
    'impresora-tinta': Droplets,
    'impresora-termica': Receipt,
    'impresora-matricial': AlignJustify,
    escaneres: ScanLine,
    plotter: PenTool,
    'multifuncional-planos': FileStack,
    'pantallas-interactivas': Presentation,
    videoconferencia: Video,
    laptops: Laptop,
    accesorios: PackageOpen,
  };

export function resolveHomeEquipmentCategoryIcon(
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): LucideIcon {
  const icon = HOME_EQUIPMENT_CATEGORY_ICONS[filterId];
  if (!icon) {
    if (import.meta.env.DEV) {
      console.warn(
        `[HomeEquipmentCategoryCarousel] Icono no definido para "${filterId}". Usando PackageOpen.`,
      );
    }
    return PackageOpen;
  }
  return icon;
}
