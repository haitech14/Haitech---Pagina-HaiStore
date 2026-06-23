import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InventoryCategorySelectGroup } from '@/lib/inventory-category-options';
import type { InventorySelectOption } from '@/lib/inventory-category-options';
import { cn } from '@/lib/utils';

interface InventorySelectFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: InventorySelectOption[];
  groups?: InventoryCategorySelectGroup[];
  disabled?: boolean;
  className?: string;
}

export function InventorySelectField({
  id,
  label,
  placeholder = 'Elegir…',
  value,
  onChange,
  options = [],
  groups = [],
  disabled = false,
  className,
}: InventorySelectFieldProps) {
  const selectValue = value || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select
        {...(selectValue ? { value: selectValue } : {})}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="h-10 w-full bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {groups.length > 0
            ? groups.map((group) => (
                <SelectGroup key={group.id}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.options.map((option) => (
                    <SelectItem key={`${group.id}-${option.value}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            : options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
    </div>
  );
}
