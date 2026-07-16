import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import { mobileBottomOffsetStyle, useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const WHATSAPP_MESSAGE =
  'Hola, consulto desde HaiStore. Necesito una cotización y asesoría para elegir el equipo adecuado. ¿Me pueden ayudar?';

/**
 * WhatsApp queda arriba del FAB de Haibot (derecha).
 * Haibot usa ~1.25rem; FAB ~3.5rem + gap → WhatsApp ~5rem desde el borde.
 */
const WHATSAPP_FAB_BOTTOM_REM = 5;

export function WhatsAppFloatingButton() {
  const bottomInset = useMobileBottomInset();
  const href = buildHaitechWhatsAppUrl(WHATSAPP_MESSAGE);

  return (
    <div
      className="group fixed right-4 z-50 sm:right-6"
      style={mobileBottomOffsetStyle(bottomInset, WHATSAPP_FAB_BOTTOM_REM)}
    >
      <div className="relative flex items-end justify-end">
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-10',
            'max-w-[10.75rem] rounded-2xl rounded-br-md bg-white px-3 py-2 text-right',
            'shadow-[0_8px_24px_rgba(15,31,61,0.14)] ring-1 ring-black/5',
            'sm:max-w-[12.5rem] sm:px-3.5 sm:py-2.5',
            'opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100 group-focus-within:opacity-100',
            'motion-reduce:transition-none',
          )}
        >
          <p className="text-xs font-bold leading-tight text-[#111111] sm:text-[0.8125rem]">
            Haibot
          </p>
          <p className="mt-0.5 text-[0.6875rem] font-semibold leading-snug text-[#25D366] sm:text-xs">
            Cotización y soporte por WhatsApp
          </p>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar con Haibot por WhatsApp: cotización y soporte técnico"
          className={cn(
            'relative flex size-12 items-center justify-center overflow-visible rounded-full transition-transform hover:scale-[1.02]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-14',
            'bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:bg-[#20bd5a]',
            'group-hover:bg-white group-hover:shadow-[0_4px_16px_rgba(15,23,42,0.14)] group-hover:hover:bg-white',
            'group-focus-within:bg-white group-focus-within:shadow-[0_4px_16px_rgba(15,23,42,0.14)]',
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          <span
            className={cn(
              'pointer-events-none absolute inset-0 flex items-center justify-center',
              'opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100 group-focus-within:opacity-100',
              'motion-reduce:transition-none',
            )}
            aria-hidden="true"
          >
            <HaibotAgentAvatar
              size="sm"
              showWhatsAppBadge
              className="size-11 sm:size-12"
            />
          </span>
        </a>
      </div>
    </div>
  );
}
