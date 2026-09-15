import { ClipboardList, MoreVertical, Plus } from 'lucide-react';

import { ProductEditorCard } from '@/components/ProductEditor/product-editor-ui';

export interface ProductAttributeRow {
  id: string;
  name: string;
  value: string;
}

interface ProductAttributesProps {
  attributes: ProductAttributeRow[];
  onAdd?: () => void;
}

export function ProductAttributes({ attributes, onAdd }: ProductAttributesProps) {
  return (
    <ProductEditorCard
      title="Atributos técnicos"
      description="Especificaciones visibles en la ficha."
      icon={<ClipboardList className="size-4" aria-hidden="true" />}
      action={
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#F8FAFC]"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Agregar atributo
        </button>
      }
    >
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Atributo</th>
              <th className="px-3 py-2.5 font-semibold">Valor</th>
              <th className="w-10 px-2 py-2.5">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {attributes.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-3 py-2.5 font-medium text-[#111827]">{row.name}</td>
                <td className="px-3 py-2.5 text-[#374151]">{row.value}</td>
                <td className="px-2 py-2.5 text-right">
                  <button
                    type="button"
                    className="inline-flex size-7 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
                    aria-label={`Opciones de ${row.name}`}
                  >
                    <MoreVertical className="size-3.5" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProductEditorCard>
  );
}
