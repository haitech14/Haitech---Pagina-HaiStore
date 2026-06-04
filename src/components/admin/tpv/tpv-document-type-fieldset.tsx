import { Button } from '@/components/ui/button';
import {
  TPV_FIELDSET_CLASS,
  TPV_FOCUS_RING_CLASS,
  TPV_SELECTED_CLASS,
} from '@/lib/tpv-highlight';
import { cn } from '@/lib/utils';
import { TPV_DOCUMENT_META, type TpvDocumentType } from '@/types/tpv';

const DOCUMENT_TYPES: TpvDocumentType[] = [
  'proforma',
  'factura',
  'boleta',
  'guia_remision',
];

interface TpvDocumentTypeFieldsetProps {
  value: TpvDocumentType;
  onChange: (type: TpvDocumentType) => void;
  disabled?: boolean;
  id?: string;
}

export function TpvDocumentTypeFieldset({
  value,
  onChange,
  disabled,
  id = 'tpv-document-type',
}: TpvDocumentTypeFieldsetProps) {
  return (
    <fieldset
      id={id}
      disabled={disabled}
      className={cn('shrink-0 rounded-lg border px-2.5 py-2', TPV_FIELDSET_CLASS)}
    >
      <legend className="mb-1.5 px-0.5 text-[0.65rem] font-medium text-muted-foreground">
        Generar comprobante PDF
      </legend>
      <div
        className="flex flex-wrap gap-1"
        role="radiogroup"
        aria-label="Tipo de comprobante"
      >
        {DOCUMENT_TYPES.map((type) => {
          const meta = TPV_DOCUMENT_META[type];
          const selected = value === type;
          return (
            <Button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              variant={selected ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              className={cn(
                'h-8 min-h-9 px-2.5 text-xs font-medium',
                TPV_FOCUS_RING_CLASS,
                selected && TPV_SELECTED_CLASS,
              )}
              onClick={() => onChange(type)}
            >
              {meta.label}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
