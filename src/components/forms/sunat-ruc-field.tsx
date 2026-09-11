import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isCompleteRuc, normalizeRucInput } from '@/lib/sunat-ruc';
import { cn } from '@/lib/utils';

interface SunatRucFieldProps {
  id: string;
  label?: string;
  value: string;
  onValueChange: (ruc: string) => void;
  isFetching?: boolean;
  isSuccess?: boolean;
  errorMessage?: string | null;
  required?: boolean;
  placeholder?: string;
  documentType?: 'ruc' | 'ruc-or-dni';
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  successMessage?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  'aria-controls'?: string;
}

export function SunatRucField({
  id,
  label = 'RUC',
  value,
  onValueChange,
  isFetching = false,
  isSuccess = false,
  errorMessage = null,
  required,
  placeholder = '20612146561',
  documentType = 'ruc',
  className,
  inputClassName,
  labelClassName,
  successMessage = 'Razón social actualizada desde SUNAT.',
  onFocus,
  onBlur,
  'aria-controls': ariaControls,
}: SunatRucFieldProps) {
  const digits = normalizeRucInput(value);
  const complete = isCompleteRuc(digits);

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className={cn(labelClassName)}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(event) => onValueChange(normalizeRucInput(event.target.value))}
          inputMode="numeric"
          autoComplete="off"
          maxLength={11}
          required={required}
          placeholder={placeholder}
          className={cn('pr-9', inputClassName)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-controls={ariaControls}
        />
        {isFetching ? (
          <Loader2
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {isFetching ? (
        <p className="text-xs text-muted-foreground" role="status">
          Consultando SUNAT…
        </p>
      ) : errorMessage && complete ? (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : isSuccess && complete ? (
        <p className="text-xs text-muted-foreground">{successMessage}</p>
      ) : digits.length > 0 && !complete && (documentType === 'ruc' || digits.length > 8) ? (
        <p className="text-xs text-muted-foreground">Completa los 11 dígitos para consultar SUNAT.</p>
      ) : null}
    </div>
  );
}
