import { useSearchParams } from 'react-router-dom';

import { CategoriesAdminPanel } from '@/components/admin/categories/categories-admin-panel';
import { AdminCategoriasDashboard } from '@/components/admin/categorias/admin-categorias-dashboard';
import { AdminMarcasDashboard } from '@/components/admin/marcas/admin-marcas-dashboard';

function resolveCategoriasVista(searchParams: URLSearchParams): string | null {
  return searchParams.get('vista');
}

export function AdminCategoriasPage() {
  const [searchParams] = useSearchParams();
  const vista = resolveCategoriasVista(searchParams);

  if (vista === 'marcas') {
    return <AdminMarcasDashboard />;
  }

  if (vista === 'etiquetas') {
    return (
      <div className="space-y-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Etiquetas de producto y filtros del catálogo.
        </p>
        <CategoriesAdminPanel />
      </div>
    );
  }

  if (vista === 'arbol') {
    return (
      <div className="space-y-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Vista de árbol conectada al inventario en tiempo real.
        </p>
        <CategoriesAdminPanel />
      </div>
    );
  }

  return <AdminCategoriasDashboard />;
}
