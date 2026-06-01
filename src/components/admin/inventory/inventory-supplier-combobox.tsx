import { useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InventorySupplierComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function InventorySupplierCombobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Buscar o escribir proveedor…',
}: InventorySupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const openList = () => {
    setSearch('');
    setOpen(true);
  };

  const filtered = useMemo(() => {
    const query = (open ? search : value).trim().toLowerCase();
    if (!query) return options;
    return options.filter((name) => name.toLowerCase().includes(query));
  }, [open, search, value, options]);

  const trimmedValue = value.trim();
  const showCreateOption =
    trimmedValue.length > 0 &&
    !options.some((name) => name.toLowerCase() === trimmedValue.toLowerCase()) &&
    !filtered.some((name) => name.toLowerCase() === trimmedValue.toLowerCase());

  const pick = (name: string) => {
    onChange(name);
    setSearch('');
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Popover
        open={open}
        onOpenChange={setOpen}
        modal={false}
      >
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <Input
              id={id}
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                setSearch(event.target.value);
                setOpen(true);
              }}
              onFocus={openList}
              onClick={openList}
              placeholder={placeholder}
              className="h-9 pr-8"
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id}-listbox`}
              aria-autocomplete="list"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-0 top-0 flex h-9 w-8 items-center justify-center rounded-r-md text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Mostrar proveedores"
              onMouseDown={(event) => {
                event.preventDefault();
                openList();
              }}
            >
              <ChevronsUpDown className="size-4" aria-hidden="true" />
            </button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          id={`${id}-listbox`}
          role="listbox"
          className="z-[200] w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar proveedor…"
              value={search}
              onValueChange={(next) => {
                setSearch(next);
                onChange(next);
              }}
              className="h-9"
            />
            <CommandList className="max-h-48">
              {filtered.length === 0 && !showCreateOption ? (
                <CommandEmpty className="py-3 text-xs text-muted-foreground">
                  {trimmedValue
                    ? 'Sin coincidencias. El nombre se guardará al guardar.'
                    : 'No hay proveedores en el catálogo aún'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filtered.map((name) => (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => pick(name)}
                      className="cursor-pointer text-sm"
                    >
                      {name}
                    </CommandItem>
                  ))}
                  {showCreateOption && (
                    <CommandItem
                      value={`__create__${trimmedValue}`}
                      onSelect={() => pick(trimmedValue)}
                      className={cn('cursor-pointer text-sm', filtered.length > 0 && 'border-t')}
                    >
                      Usar «{trimmedValue}»
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
