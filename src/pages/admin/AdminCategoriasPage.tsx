import { CategoriesAdminPanel } from '@/components/admin/categories/categories-admin-panel';

export function AdminCategoriasPage() {
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Organiza el catálogo por familias y subcategorías. Los conteos se sincronizan con el
        inventario de la tienda.
      </p>
      <CategoriesAdminPanel />
    </div>
  );
}
