import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCatalogPriceBounds,
  getCategoryCounts,
  getCategoryLabel,
} from '@/data/services-catalog';
import type {
  ServiceAvailability,
  ServiceCatalogCategoryId,
  ServiceCatalogFilters,
  ServiceContractType,
} from '@/types/services-catalog';
import { cn } from '@/lib/utils';

const AVAILABILITY_OPTIONS: { id: ServiceAvailability; label: string }[] = [
  { id: 'disponible', label: 'Disponible ahora' },
  { id: 'reserva', label: 'Bajo reserva' },
  { id: 'popular', label: 'Popular' },
];

const CONTRACT_OPTIONS: { id: ServiceContractType; label: string }[] = [
  { id: 'mensual', label: 'Mensual' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'anual', label: 'Anual' },
  { id: 'evento', label: 'Por evento' },
];

const EVENT_CAPACITY_OPTIONS = [
  { value: 20, label: 'Hasta 20 personas' },
  { value: 50, label: 'Hasta 50 personas' },
  { value: 100, label: 'Hasta 100 personas' },
];

interface ServicesCatalogFiltersProps {
  filters: ServiceCatalogFilters;
  onChange: (filters: ServiceCatalogFilters) => void;
  className?: string;
}

function FilterSection({
  title,
  titleId,
  children,
}: {
  title: string;
  titleId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/60 py-4 last:border-b-0">
      <h3 id={titleId} className="mb-3 text-sm font-bold text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckboxRow({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="size-4 rounded border-border text-red-600 focus-visible:ring-red-600"
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      {count != null ? (
        <span className="text-xs text-muted-foreground/80">({count})</span>
      ) : null}
    </label>
  );
}

function RadioRow({
  id,
  name,
  label,
  count,
  checked,
  onSelect,
}: {
  id: string;
  name: string;
  label: string;
  count?: number;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        name={name}
        type="radio"
        checked={checked}
        onClick={() => {
          if (checked) onSelect();
        }}
        onChange={() => {
          if (!checked) onSelect();
        }}
        className="size-4 border-border text-red-600 focus-visible:ring-red-600"
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      {count != null ? (
        <span className="text-xs text-muted-foreground/80">({count})</span>
      ) : null}
    </label>
  );
}

export function ServicesCatalogFiltersPanel({
  filters,
  onChange,
  className,
}: ServicesCatalogFiltersProps) {
  const bounds = getCatalogPriceBounds();
  const counts = getCategoryCounts();
  const sliderMin = bounds.min;
  const sliderMax = bounds.max;
  const currentMin = filters.priceMin ?? sliderMin;
  const currentMax = filters.priceMax ?? sliderMax;

  const selectCategory = (categoryId: ServiceCatalogCategoryId) => {
    onChange({
      ...filters,
      categories: filters.categories.includes(categoryId) ? [] : [categoryId],
    });
  };

  const toggleAvailability = (value: ServiceAvailability, checked: boolean) => {
    onChange({
      ...filters,
      availability: checked
        ? [...filters.availability, value]
        : filters.availability.filter((id) => id !== value),
    });
  };

  const toggleContract = (value: ServiceContractType, checked: boolean) => {
    onChange({
      ...filters,
      contractTypes: checked
        ? [...filters.contractTypes, value]
        : filters.contractTypes.filter((id) => id !== value),
    });
  };

  const toggleCapacity = (value: number, checked: boolean) => {
    onChange({
      ...filters,
      eventCapacities: checked
        ? [...filters.eventCapacities, value]
        : filters.eventCapacities.filter((id) => id !== value),
    });
  };

  const categoryIds = [
    'alquiler',
    'servicio-tecnico',
    'outsourcing',
    'servicios-corporativos',
  ] as const;

  return (
    <aside className={cn('rounded-xl border border-border/70 bg-card p-4 shadow-sm', className)}>
      <FilterSection title="Categorías" titleId="filter-categories-heading">
        <div
          role="radiogroup"
          aria-labelledby="filter-categories-heading"
          className="space-y-1"
        >
          {categoryIds.map((categoryId) => (
            <RadioRow
              key={categoryId}
              id={`filter-cat-${categoryId}`}
              name="filter-service-category"
              label={getCategoryLabel(categoryId)}
              count={counts[categoryId] ?? 0}
              checked={filters.categories.includes(categoryId)}
              onSelect={() => selectCategory(categoryId)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Disponibilidad">
        <div className="space-y-1">
          {AVAILABILITY_OPTIONS.map((option) => (
            <CheckboxRow
              key={option.id}
              id={`filter-avail-${option.id}`}
              label={option.label}
              checked={filters.availability.includes(option.id)}
              onCheckedChange={(checked) => toggleAvailability(option.id, checked)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rango de precio">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="filter-price-min" className="text-xs text-muted-foreground">
              Mínimo (S/)
            </Label>
            <Input
              id="filter-price-min"
              type="number"
              min={sliderMin}
              max={currentMax}
              value={currentMin}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMin: Number(e.target.value) || sliderMin,
                })
              }
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label htmlFor="filter-price-max" className="text-xs text-muted-foreground">
              Máximo (S/)
            </Label>
            <Input
              id="filter-price-max"
              type="number"
              min={currentMin}
              max={sliderMax}
              value={currentMax}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMax: Number(e.target.value) || sliderMax,
                })
              }
              className="mt-1 h-9"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Tipo de contrato">
        <div className="space-y-1">
          {CONTRACT_OPTIONS.map((option) => (
            <CheckboxRow
              key={option.id}
              id={`filter-contract-${option.id}`}
              label={option.label}
              checked={filters.contractTypes.includes(option.id)}
              onCheckedChange={(checked) => toggleContract(option.id, checked)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Capacidad para eventos">
        <div className="space-y-1">
          {EVENT_CAPACITY_OPTIONS.map((option) => (
            <CheckboxRow
              key={option.value}
              id={`filter-capacity-${option.value}`}
              label={option.label}
              checked={filters.eventCapacities.includes(option.value)}
              onCheckedChange={(checked) => toggleCapacity(option.value, checked)}
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
