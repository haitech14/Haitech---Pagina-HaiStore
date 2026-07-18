import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { HEADER_ADVISOR_WHATSAPP_LINK } from '@/data/site-header';
import { cn } from '@/lib/utils';

type HeaderWhatsAppButtonProps = {
  className?: string;
};

export function HeaderWhatsAppButton({ className }: HeaderWhatsAppButtonProps) {
  return (
    <a
      href={HEADER_ADVISOR_WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-medium text-white',
        'transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]',
        className,
      )}
    >
      <WhatsAppIcon size={0.85} className="text-[#25D366]" />
      WhatsApp
    </a>
  );
}
