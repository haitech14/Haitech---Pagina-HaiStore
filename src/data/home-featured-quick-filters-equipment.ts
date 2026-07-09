export type HomeFeaturedEquipmentConditionFilterId =
  | 'todas'
  | 'nuevas'
  | 'seminuevas'
  | 'remanufacturadas';

export type HomeFeaturedEquipmentCategoryFilterId =
  | 'multifuncionales'
  | 'impresora-laser'
  | 'impresora-tinta'
  | 'impresora-termica'
  | 'impresora-matricial'
  | 'escaneres'
  | 'plotter'
  | 'multifuncional-planos'
  | 'pantallas-interactivas'
  | 'videoconferencia'
  | 'laptops'
  | 'accesorios';

export type HomeFeaturedEquipmentConditionFilter = {
  id: HomeFeaturedEquipmentConditionFilterId;
  label: string;
};

export type HomeFeaturedEquipmentCategoryFilter = {
  id: HomeFeaturedEquipmentCategoryFilterId;
  label: string;
};

export const HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS: HomeFeaturedEquipmentConditionFilter[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nuevas', label: 'Nuevas' },
  { id: 'seminuevas', label: 'Seminuevas' },
  { id: 'remanufacturadas', label: 'Remanufacturadas' },
];

export const HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS: HomeFeaturedEquipmentCategoryFilter[] = [
  { id: 'multifuncionales', label: 'Multifuncionales' },
  { id: 'impresora-laser', label: 'Impresora Laser' },
  { id: 'impresora-tinta', label: 'Impresora de Tinta' },
  { id: 'impresora-termica', label: 'Impresora Térmica' },
  { id: 'impresora-matricial', label: 'Impresora Matricial' },
  { id: 'escaneres', label: 'Escáneres' },
  { id: 'plotter', label: 'Plotter' },
  { id: 'multifuncional-planos', label: 'Multifuncional de Planos' },
  { id: 'pantallas-interactivas', label: 'Pantallas Interactivas' },
  { id: 'videoconferencia', label: 'Videoconferencia' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'accesorios', label: 'Accesorios' },
];

export const HOME_FEATURED_EQUIPMENT_DEFAULT_CONDITION: HomeFeaturedEquipmentConditionFilterId =
  'todas';
export const HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY: HomeFeaturedEquipmentCategoryFilterId =
  'multifuncionales';
