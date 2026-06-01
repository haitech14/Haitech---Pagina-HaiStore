import { useMemo, useState } from 'react';
import { ChevronsUpDown, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { InventorySelectOption } from '@/lib/inventory-category-options';
import { cn } from '@/lib/utils';

interface InventoryMultiSelectFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options: InventorySelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function InventoryMultiSelectField({
  id,
  label,
  placeholder = 'Seleccionar…',
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Sin coincidencias',
  options,
  selected,
  onChange,
  disabled = false,
}: InventoryMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  const remove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : `${selected.length} seleccionada${selected.length === 1 ? '' : 's'}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
            className={cn(
              'h-auto min-h-11 w-full justify-between gap-2 px-3 py-2 font-normal',
              selected.length === 0 && 'text-muted-foreground',
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left">
              {selected.length === 0 ? (
                <span>{placeholder}</span>
              ) : (
                selected.map((value) => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="max-w-full truncate font-normal"
                  >
                    {value}
                  </Badge>
                ))
              )}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
            <span className="sr-only">{triggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedSet.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggle(option.value)}
                      onMouseDown={(event) => event.preventDefault()}
                      className="cursor-pointer gap-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="pointer-events-none"
                      />
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label={`${label} seleccionadas`}>
          {selected.map((value) => (
            <li key={value}>
              <Badge variant="outline" className="gap-1 pr-1 font-normal">
                <span className="max-w-[12rem] truncate">{value}</span>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Quitar ${value}`}
                  onClick={() => remove(value)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
