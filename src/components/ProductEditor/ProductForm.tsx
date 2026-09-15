import { Copy, FileText, Info, UploadCloud, X } from 'lucide-react';

import {
  PRODUCT_EDITOR_INPUT_CLASS,
  PRODUCT_EDITOR_LABEL_CLASS,
  ProductEditorCard,
} from '@/components/ProductEditor/product-editor-ui';
import { cn } from '@/lib/utils';

export interface ProductFormValues {
  code: string;
  statusLabel: string;
  name: string;
  slug: string;
  description: string;
  technicalSheetName: string;
  technicalSheetSize: string;
}

interface ProductFormProps {
  values: ProductFormValues;
  onChange: (patch: Partial<ProductFormValues>) => void;
}

export function ProductForm({ values, onChange }: ProductFormProps) {
  const descriptionCount = values.description.length;

  return (
    <div className="space-y-5">
      <ProductEditorCard
        title="Información principal"
        description="Datos generales del producto."
        icon={<Info className="size-4" aria-hidden="true" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-code">
              Código <span className="text-[#EF233C]">*</span>
            </label>
            <input
              id="pe-code"
              className={PRODUCT_EDITOR_INPUT_CLASS}
              value={values.code}
              onChange={(event) => onChange({ code: event.target.value })}
            />
          </div>
          <div>
            <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-status">
              Estado de publicación
            </label>
            <select
              id="pe-status"
              className={PRODUCT_EDITOR_INPUT_CLASS}
              value={values.statusLabel}
              onChange={(event) => onChange({ statusLabel: event.target.value })}
            >
              <option value="Activo (visible en tienda)">🟢 Activo (visible en tienda)</option>
              <option value="Borrador">Borrador</option>
              <option value="Oculto">Oculto</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-name">
            Nombre del producto <span className="text-[#EF233C]">*</span>
          </label>
          <input
            id="pe-name"
            className={PRODUCT_EDITOR_INPUT_CLASS}
            value={values.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-slug">
            URL amigable (slug SEO)
          </label>
          <div className="relative">
            <input
              id="pe-slug"
              className={cn(PRODUCT_EDITOR_INPUT_CLASS, 'pr-10')}
              value={values.slug}
              onChange={(event) => onChange({ slug: event.target.value })}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
              aria-label="Copiar slug"
              onClick={() => {
                void navigator.clipboard?.writeText(values.slug);
              }}
            >
              <Copy className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className={PRODUCT_EDITOR_LABEL_CLASS} htmlFor="pe-description">
            Descripción <span className="text-[#EF233C]">*</span>
          </label>
          <div className="relative">
            <textarea
              id="pe-description"
              rows={6}
              maxLength={1000}
              className={cn(
                PRODUCT_EDITOR_INPUT_CLASS,
                'h-auto min-h-[9rem] resize-y py-2.5 leading-relaxed',
              )}
              value={values.description}
              onChange={(event) => onChange({ description: event.target.value })}
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] tabular-nums text-[#9CA3AF]">
              {descriptionCount}/1000
            </span>
          </div>
        </div>
      </ProductEditorCard>

      <ProductEditorCard
        title="Ficha técnica"
        description="Adjunta la ficha técnica en PDF o imagen."
        icon={<FileText className="size-4" aria-hidden="true" />}
      >
        <div className="space-y-3">
          <button
            type="button"
            className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-4 py-5 text-center transition-colors hover:border-[#EF233C]/40 hover:bg-white"
          >
            <UploadCloud className="size-6 text-[#9CA3AF]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#374151]">
              Arrastra un archivo aquí
            </span>
            <span className="text-xs text-[#6B7280]">o haz clic para seleccionar</span>
            <span className="mt-1 text-[10px] text-[#9CA3AF]">
              PDF, JPG o PNG. Máx. 25 MB
            </span>
          </button>

          {values.technicalSheetName ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#EF233C]">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {values.technicalSheetName}
                </p>
                <p className="text-xs text-[#6B7280]">{values.technicalSheetSize}</p>
              </div>
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Quitar ficha técnica"
                onClick={() =>
                  onChange({ technicalSheetName: '', technicalSheetSize: '' })
                }
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </ProductEditorCard>
    </div>
  );
}
