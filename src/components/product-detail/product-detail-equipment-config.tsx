import { useCallback, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  computeEquipmentExtrasPen,
  type EquipmentSelectionState,
} from '@/lib/equipment-config-selection';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { EquipmentConfigStep } from '@/types/product-detail';

interface ProductDetailEquipmentConfigProps {
  steps: EquipmentConfigStep[];
  selection: EquipmentSelectionState;
  onSelectionChange: (selection: EquipmentSelectionState) => void;
  className?: string;
  /** Oculta el título cuando va dentro de una pestaña. */
  hideTitle?: boolean;
}

function formatOptionPrice(pricePen: number): string | null {
  if (pricePen <= 0) return null;
  return `+ S/ ${pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductDetailEquipmentConfig({
  steps,
  selection,
  onSelectionChange,
  className,
  hideTitle = false,
}: ProductDetailEquipmentConfigProps) {
  const sectionId = useId();

  const extrasTotalPen = useMemo(() => {
    const selectedOptions = steps.flatMap((step) => {
      const selectedIds = selection[step.id] ?? new Set<string>();
      return step.options.filter((option) => selectedIds.has(option.id));
    });
    return computeEquipmentExtrasPen(
      selectedOptions.map((option) => ({
        stepNumber: 0,
        stepTitle: '',
        optionId: option.id,
        optionName: option.name,
        pricePen: option.pricePen,
        ...(option.included ? { included: true } : {}),
      })),
    );
  }, [selection, steps]);

  const toggleOption = useCallback(
    (stepId: string, optionId: string, checked: boolean) => {
      onSelectionChange({
        ...selection,
        [stepId]: (() => {
          const next = new Set(selection[stepId] ?? []);
          if (checked) {
            next.add(optionId);
          } else {
            next.delete(optionId);
          }
          return next;
        })(),
      });
    },
    [onSelectionChange, selection],
  );

  if (steps.length === 0) return null;

  return (
    <section
      className={cn('space-y-2.5 sm:space-y-3', className)}
      aria-labelledby={sectionId}
    >
      {hideTitle ? (
        <h2 id={sectionId} className="sr-only">
          Configuración del equipo
        </h2>
      ) : (
        <h2 id={sectionId} className="text-base font-bold text-[#0f1f3d] sm:text-lg">
          Configuración del equipo
        </h2>
      )}

      {extrasTotalPen > 0 ? (
        <p className="text-sm font-semibold text-red-600">
          Adicionales: S/ {extrasTotalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ) : null}

      <EquipmentConfigStepList
        sectionId={sectionId}
        steps={steps}
        selection={selection}
        onToggleOption={toggleOption}
      />
    </section>
  );
}

interface EquipmentConfigStepListProps {
  sectionId: string;
  steps: EquipmentConfigStep[];
  selection: EquipmentSelectionState;
  onToggleOption: (stepId: string, optionId: string, checked: boolean) => void;
}

function EquipmentConfigStepList({
  sectionId,
  steps,
  selection,
  onToggleOption,
}: EquipmentConfigStepListProps) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-1">
      {steps.map((step) => {
        const isOpen = Boolean(openSteps[step.id]);
        const panelId = `${sectionId}-${step.id}`;
        const selected = selection[step.id] ?? new Set<string>();
        const selectedCount = selected.size;

        return (
          <div key={step.id} className="overflow-hidden rounded-md">
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-3 bg-[#0f1f3d] px-3.5 py-3 text-left text-white sm:px-4',
                'transition-colors hover:bg-[#0f1f3d]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenSteps((current) => ({ ...current, [step.id]: !current[step.id] }))}
            >
              <span className="min-w-0 flex-1 text-xs font-semibold leading-snug sm:text-sm">
                Paso {step.stepNumber}: {step.title}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[0.625rem] font-bold tracking-[0.1em] text-white sm:text-[0.6875rem]">
                EXPANDIR
                <ChevronDown
                  className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </span>
            </button>

            <div
              id={panelId}
              hidden={!isOpen}
              className={cn(
                'border border-t-0 border-border/60 bg-white px-4 py-4',
                !isOpen && 'hidden',
              )}
            >
              <p className="mb-3 text-xs text-muted-foreground">{step.subtitle}</p>
              <ul className="space-y-2">
                {step.options.map((option) => {
                  const inputId = `${panelId}-${option.id}`;
                  const isChecked = selected.has(option.id);
                  const priceLabel = option.included ? 'Incluido' : formatOptionPrice(option.pricePen);
                  const imageSrc = option.image ?? '/categories/repuestos.png';
                  const productHref = option.productId ? productPath(option.productId) : null;

                  return (
                    <li key={option.id}>
                      <label
                        htmlFor={inputId}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                          isChecked
                            ? 'border-red-600/30 bg-red-50/60'
                            : 'border-border/60 bg-muted/10 hover:border-border',
                        )}
                      >
                        <Checkbox
                          id={inputId}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            onToggleOption(step.id, option.id, checked === true)
                          }
                          className="shrink-0 border-neutral-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                        />
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border/50 bg-white">
                          <img
                            src={imageSrc}
                            alt={option.name}
                            loading="lazy"
                            className="size-full object-contain p-1"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                            {productHref ? (
                              <Link
                                to={productHref}
                                onClick={(event) => event.stopPropagation()}
                                className="text-sm font-semibold text-[#0f1f3d] underline-offset-2 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                              >
                                {option.name}
                              </Link>
                            ) : (
                              <span className="text-sm font-semibold text-[#0f1f3d]">{option.name}</span>
                            )}
                            {priceLabel ? (
                              <span
                                className={cn(
                                  'shrink-0 text-xs font-bold',
                                  option.included ? 'text-emerald-600' : 'text-red-600',
                                )}
                              >
                                {priceLabel}
                              </span>
                            ) : null}
                          </span>
                          {option.description ? (
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {option.description}
                            </span>
                          ) : null}
                          {option.sku ? (
                            <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground/80">
                              SKU: {option.sku}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {selectedCount > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {selectedCount} opción{selectedCount === 1 ? '' : 'es'} seleccionada
                  {selectedCount === 1 ? '' : 's'}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
