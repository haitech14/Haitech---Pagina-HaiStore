import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import {
  HEADER_QUOTE_WHATSAPP_LABEL,
  HEADER_QUOTE_WHATSAPP_LINK,
} from '@/data/site-header';
import { MAIN_NAV_WHATSAPP_BUTTON_CLASS } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

type HeaderQuoteWhatsAppButtonProps = {
  className?: string;
};

export function HeaderQuoteWhatsAppButton({ className }: HeaderQuoteWhatsAppButtonProps) {
  return (
    <a
      href={HEADER_QUOTE_WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(MAIN_NAV_WHATSAPP_BUTTON_CLASS, className)}
    >
      <WhatsAppIcon size={0.85} />
      {HEADER_QUOTE_WHATSAPP_LABEL}
    </a>
  );
}
