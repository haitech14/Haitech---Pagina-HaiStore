import { mobileBottomOffsetStyle, useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const WHATSAPP_MESSAGE =
  'Hola, consulto desde HaiStore. Necesito ayuda para cotizar o elegir un producto. ¿Me pueden orientar?';

export function WhatsAppFloatingButton() {
  const bottomInset = useMobileBottomInset();
  const href = buildHaitechWhatsAppUrl(WHATSAPP_MESSAGE);

  return (
    <div
      className="fixed right-5 z-50 flex flex-col items-end sm:right-6"
      style={mobileBottomOffsetStyle(bottomInset, 1.25)}
    >
      <div className="group relative flex items-center">
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute right-[calc(100%+0.625rem)] top-1/2 z-10 max-w-[min(16rem,calc(100vw-6rem))] -translate-y-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold leading-snug text-white shadow-lg',
            'opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100 group-focus-within:opacity-100',
            'motion-reduce:transition-none',
            'after:absolute after:left-full after:top-1/2 after:size-0 after:-translate-y-1/2 after:border-y-[6px] after:border-l-[7px] after:border-y-transparent after:border-l-neutral-900',
          )}
        >
          <span className="sm:hidden">Cotizar</span>
          <span className="hidden sm:inline">¿Necesitas ayuda? Cotiza por WhatsApp</span>
        </span>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cotizar por WhatsApp: ¿Necesitas ayuda? Cotiza por WhatsApp"
          className={cn(
            'flex size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-transform hover:scale-[1.02] hover:bg-[#20bd5a]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-14',
          )}
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
