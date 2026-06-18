import { cn } from '@/lib/utils';

/** Logo con marco negro — header, login en fondo claro (PNG para nitidez; favicon sigue en /logo.ico). */
export const SITE_HEADER_LOGO_SRC = '/logo.png';
/** Logo claro — footer y fondos oscuros. */
export const SITE_FOOTER_LOGO_SRC = '/logoclaro.png';
export const SITE_LOGO_ALT = 'HAITECH - Soluciones de impresión';

type LogoImageProps = {
  className?: string;
  heightClass?: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
};

function LogoImage({
  src,
  className,
  heightClass = 'h-10',
  width,
  height,
  loading,
}: LogoImageProps & { src: string }) {
  return (
    <img
      src={src}
      alt={SITE_LOGO_ALT}
      className={cn('w-auto object-contain', heightClass, className)}
      width={width}
      height={height}
      loading={loading}
    />
  );
}

export function HeaderLogoImage(props: LogoImageProps) {
  return <LogoImage src={SITE_HEADER_LOGO_SRC} {...props} />;
}

export function FooterLogoImage(props: LogoImageProps) {
  return <LogoImage src={SITE_FOOTER_LOGO_SRC} {...props} />;
}
