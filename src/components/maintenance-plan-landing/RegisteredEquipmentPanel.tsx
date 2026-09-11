import { Check, Printer } from 'lucide-react';

import type { HaiSupportRegisteredEquipment } from '@/lib/haisupport-visit';
import { cn } from '@/lib/utils';

interface RegisteredEquipmentPanelProps {
  equipment: readonly HaiSupportRegisteredEquipment[];
  selectedKey: string | null;
  onSelect: (item: HaiSupportRegisteredEquipment) => void;
  loading?: boolean;
  foundClient?: boolean;
}

function equipmentKey(item: HaiSupportRegisteredEquipment): string {
  return `${item.model}|${item.serial}`;
}

export function RegisteredEquipmentPanel({
  equipment,
  selectedKey,
  onSelect,
  loading = false,
  foundClient = false,
}: RegisteredEquipmentPanelProps) {
  if (!foundClient && !loading && equipment.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.45)]">
      <p className="text-sm font-bold text-[#111111]">Equipos registrados</p>
      <p className="mt-0.5 text-xs text-[#6B7280]">HaiSupport · elige uno para completar el modelo</p>

      {loading ? (
        <p className="mt-3 text-xs text-[#9CA3AF]">Buscando equipos del RUC…</p>
      ) : equipment.length === 0 ? (
        <p className="mt-3 text-xs text-[#9CA3AF]">
          No hay equipos registrados. Completa el modelo en el formulario.
        </p>
      ) : (
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {equipment.map((item) => {
            const key = equipmentKey(item);
            const selected = selectedKey === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
                    selected
                      ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                      selected ? 'bg-white text-[#E30613]' : 'bg-[#F7F7F8] text-[#4B5563]',
                    )}
                    aria-hidden
                  >
                    <Printer className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold leading-snug text-[#111111]">
                      {item.model}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#6B7280]">
                      {item.serial ? `Serie ${item.serial}` : 'Sin serie'}
                      {item.lastTicket ? ` · ${item.lastTicket}` : ''}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selected
                        ? 'border-[#E30613] bg-[#E30613] text-white'
                        : 'border-[#D1D5DB] bg-white text-transparent',
                    )}
                    aria-hidden
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
