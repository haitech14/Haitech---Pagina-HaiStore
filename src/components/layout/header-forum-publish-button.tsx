import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { MAIN_NAV_CATEGORIES_BUTTON_CLASS } from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

type HeaderForumPublishButtonProps = {
  className?: string;
};

export function HeaderForumPublishButton({ className }: HeaderForumPublishButtonProps) {
  return (
    <Link to="/foro/nuevo" className={cn(MAIN_NAV_CATEGORIES_BUTTON_CLASS, className)}>
      <Plus className="size-4" aria-hidden="true" />
      Publicar consulta
    </Link>
  );
}
