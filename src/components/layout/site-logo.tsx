import { Link } from 'react-router-dom';

import { SITE_LOGO_ASSET_PATH } from '@/lib/site-logo-asset';
import { cn } from '@/lib/utils';
/** Logo HAITECH — header, login y PDF. */
export const SITE_HEADER_LOGO_SRC = SITE_LOGO_ASSET_PATH;
/** Mismo asset; en footer se invierte para fondos oscuros. */
export const SITE_FOOTER_LOGO_SRC = SITE_LOGO_ASSET_PATH;
export const SITE_LOGO_ALT = 'HaiStore - HAITECH Soluciones de impresión';

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

export function HeaderLogoLink({ className, ...props }: LogoImageProps) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center', className)} aria-label="HaiStore, inicio">
      <HeaderLogoImage {...props} />
    </Link>
  );
}

export function FooterLogoImage({ className, ...props }: LogoImageProps) {
  return (
    <LogoImage
      src={SITE_FOOTER_LOGO_SRC}
      {...props}
      {...(className ? { className } : {})}
    />
  );
}
