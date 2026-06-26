import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getSoftwareCatalogPriceBounds,
  getSoftwareCategoryCounts,
  getSoftwareCategoryLabel,
  SOFTWARE_CATALOG_CATEGORIES,
} from '@/data/software-catalog';
import type {
  SoftwareAvailability,
  SoftwareCatalogCategoryId,
  SoftwareCatalogFilters,
  SoftwareContractType,
} from '@/types/software-catalog';
import { cn } from '@/lib/utils';

const AVAILABILITY_OPTIONS: { id: SoftwareAvailability; label: string }[] = [
  { id: 'disponible', label: 'Disponible ahora' },
  { id: 'reserva', label: 'Bajo reserva' },
  { id: 'popular', label: 'Popular' },
];

const CONTRACT_OPTIONS: { id: SoftwareContractType; label: string }[] = [
  { id: 'mensual', label: 'Mensual' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'anual', label: 'Anual' },
];

interface SoftwareCatalogFiltersProps {
  filters: SoftwareCatalogFilters;
  onChange: (filters: SoftwareCatalogFilters) => void;
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

export function SoftwareCatalogFiltersPanel({
  filters,
  onChange,
  className,
}: SoftwareCatalogFiltersProps) {
  const bounds = getSoftwareCatalogPriceBounds();
  const counts = getSoftwareCategoryCounts();
  const sliderMin = bounds.min;
  const sliderMax = bounds.max;
  const currentMin = filters.priceMin ?? sliderMin;
  const currentMax = filters.priceMax ?? sliderMax;

  const selectCategory = (categoryId: SoftwareCatalogCategoryId) => {
    onChange({
      ...filters,
      categories: filters.categories.includes(categoryId) ? [] : [categoryId],
    });
  };

  const toggleAvailability = (value: SoftwareAvailability, checked: boolean) => {
    onChange({
      ...filters,
      availability: checked
        ? [...filters.availability, value]
        : filters.availability.filter((id) => id !== value),
    });
  };

  const toggleContract = (value: SoftwareContractType, checked: boolean) => {
    onChange({
      ...filters,
      contractTypes: checked
        ? [...filters.contractTypes, value]
        : filters.contractTypes.filter((id) => id !== value),
    });
  };

  return (
    <aside className={cn('rounded-xl border border-border/70 bg-card p-4 shadow-sm', className)}>
      <FilterSection title="Categorías" titleId="filter-software-categories-heading">
        <div
          role="radiogroup"
          aria-labelledby="filter-software-categories-heading"
          className="space-y-1"
        >
          {SOFTWARE_CATALOG_CATEGORIES.map((category) => (
            <RadioRow
              key={category.id}
              id={`filter-software-cat-${category.id}`}
              name="filter-software-category"
              label={getSoftwareCategoryLabel(category.id)}
              count={counts[category.id] ?? 0}
              checked={filters.categories.includes(category.id)}
              onSelect={() => selectCategory(category.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Disponibilidad">
        <div className="space-y-1">
          {AVAILABILITY_OPTIONS.map((option) => (
            <CheckboxRow
              key={option.id}
              id={`filter-software-avail-${option.id}`}
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
            <Label htmlFor="filter-software-price-min" className="text-xs text-muted-foreground">
              Mínimo (S/)
            </Label>
            <Input
              id="filter-software-price-min"
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
            <Label htmlFor="filter-software-price-max" className="text-xs text-muted-foreground">
              Máximo (S/)
            </Label>
            <Input
              id="filter-software-price-max"
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
              id={`filter-software-contract-${option.id}`}
              label={option.label}
              checked={filters.contractTypes.includes(option.id)}
              onCheckedChange={(checked) => toggleContract(option.id, checked)}
            />
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
