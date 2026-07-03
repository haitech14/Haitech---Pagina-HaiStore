import { Link, type LinkProps } from 'react-router-dom';

import { prefetchStoreRouteFromEvent } from '@/lib/prefetch-store-route';

/** Enlace que precarga chunk y datos de /tienda al pasar el cursor o enfocar. */
export function StorePrefetchLink({ onMouseEnter, onFocus, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      onMouseEnter={(event) => {
        prefetchStoreRouteFromEvent();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetchStoreRouteFromEvent();
        onFocus?.(event);
      }}
    />
  );
}
