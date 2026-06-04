import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MARKETING_HELP_BANNER } from '@/data/marketing-inbox-mock';

const STORAGE_KEY = 'marketing-help-banner-dismissed';

export function MarketingHelpBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Ayuda de Marketing"
      className="flex shrink-0 items-center justify-between gap-3 border-b border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-950 sm:px-5"
    >
      <p className="min-w-0 flex-1">
        {MARKETING_HELP_BANNER.split('videotutoriales')[0]}
        <button
          type="button"
          className="font-medium text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          videotutoriales
        </button>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-sky-800 hover:bg-sky-100"
        onClick={dismiss}
        aria-label="Cerrar aviso de ayuda"
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
