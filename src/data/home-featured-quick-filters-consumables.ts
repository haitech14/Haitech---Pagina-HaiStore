export type HomeFeaturedConsumablesConditionFilterId =
  | 'originales'
  | 'compatibles'
  | 'remanufacturados'
  | 'recargas';

export type HomeFeaturedConsumablesCategoryFilterId =
  | 'toner'
  | 'repuestos-cat'
  | 'tintas'
  | 'unidad-imagen-kit-mantenimiento'
  | 'unidad-fusora'
  | 'unidad-transferencia'
  | 'tarjetas';

export type HomeFeaturedConsumablesConditionFilter = {
  id: HomeFeaturedConsumablesConditionFilterId;
  label: string;
};

export type HomeFeaturedConsumablesCategoryFilter = {
  id: HomeFeaturedConsumablesCategoryFilterId;
  label: string;
  labelLines?: [string, string];
  wide?: boolean;
};

export const HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS: HomeFeaturedConsumablesConditionFilter[] =
  [
    { id: 'originales', label: 'Originales' },
    { id: 'compatibles', label: 'Compatibles' },
    { id: 'remanufacturados', label: 'Remanufacturados' },
    { id: 'recargas', label: 'Recargas' },
  ];

export const HOME_FEATURED_CONSUMABLES_CATEGORY_FILTERS: HomeFeaturedConsumablesCategoryFilter[] = [
  { id: 'toner', label: 'Toner' },
  { id: 'tintas', label: 'Tintas' },
  { id: 'repuestos-cat', label: 'Repuestos' },
  {
    id: 'unidad-imagen-kit-mantenimiento',
    label: 'Unidad de imagen y Kit de mantenimiento',
    labelLines: ['Unidad de imagen y', 'Kit de mantenimiento'],
    wide: true,
  },
  { id: 'unidad-fusora', label: 'Unidad Fusora' },
  { id: 'unidad-transferencia', label: 'Unidad de Transferencia' },
  { id: 'tarjetas', label: 'Tarjetas' },
];

export const HOME_FEATURED_CONSUMABLES_DEFAULT_CONDITION: HomeFeaturedConsumablesConditionFilterId =
  'originales';
export const HOME_FEATURED_CONSUMABLES_DEFAULT_CATEGORY: HomeFeaturedConsumablesCategoryFilterId =
  'toner';
