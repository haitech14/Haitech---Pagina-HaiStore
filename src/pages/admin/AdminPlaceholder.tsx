import { adminPlaceholderCopy } from '@/data/admin-site-content';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

interface AdminPlaceholderProps {
  page: keyof typeof adminPlaceholderCopy | string;
}

export function AdminPlaceholder({ page }: AdminPlaceholderProps) {
  const copy = adminPlaceholderCopy[page] ?? {
    title: 'Módulo en desarrollo',
    description: 'Esta sección estará disponible próximamente.',
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h2 className="mb-2 text-2xl font-bold text-foreground">{copy.title}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{copy.description}</p>
      <AdminEmptyState title={copy.title} description={copy.description} />
    </div>
  );
}
