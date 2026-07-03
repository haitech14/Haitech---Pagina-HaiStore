import { ChevronDown } from 'lucide-react';

import { navChevronClass, type MainNavRowVariant } from '@/components/layout/main-nav-styles';

type HeaderNavChevronProps = {
  navRow: MainNavRowVariant;
  open: boolean;
};

export function HeaderNavChevron({ navRow, open }: HeaderNavChevronProps) {
  return (
    <ChevronDown
      aria-hidden="true"
      strokeWidth={2}
      className={navChevronClass(navRow, open)}
    />
  );
}
