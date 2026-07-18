import { cn } from '@/lib/utils';

type WhatsAppIconProps = {
  className?: string;
  /** Tamaño aproximado en rem (por defecto ~1). */
  size?: number;
};

/** Icono WhatsApp inline (evita @mdi en chunks críticos). */
export function WhatsAppIcon({ className, size = 1 }: WhatsAppIconProps) {
  const px = `${size * 1.25}rem`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={px}
      height={px}
      aria-hidden="true"
      className={cn('shrink-0 fill-current', className)}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.76 14.05c-.24.68-1.41 1.25-1.95 1.33-.5.07-1.14.1-1.84-.12-.42-.13-.97-.32-1.67-.62-2.94-1.27-4.86-4.24-5.01-4.44-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.07.89 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.39-.45.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.36 1.46.3.15.47.12.64-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.08.12.08.71-.16 1.39z" />
    </svg>
  );
}
