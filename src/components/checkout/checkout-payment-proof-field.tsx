import { useRef, useState } from 'react';
import { CheckCircle2, Paperclip, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckoutPaymentProofFieldProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  hint?: string;
}

export function CheckoutPaymentProofField({
  file,
  onFileChange,
  disabled = false,
  hint = 'Adjunta la captura o el PDF de tu pago (JPG, PNG, WEBP o PDF, máx. 5 MB).',
}: CheckoutPaymentProofFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!next) {
      onFileChange(null);
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar 5 MB.');
      return;
    }
    setError(null);
    onFileChange(next);
  };

  return (
    <div className="rounded-lg border border-border bg-muted/15 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Paperclip className="size-4 text-red-600" aria-hidden="true" />
        Comprobante de pago
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
      {file ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {file.name}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        className={cn('mt-3 min-h-10 w-full gap-2 sm:w-auto', file && 'border-emerald-600/40')}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" aria-hidden="true" />
        {file ? 'Cambiar comprobante' : 'Subir comprobante'}
      </Button>
    </div>
  );
}
