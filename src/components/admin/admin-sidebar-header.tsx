import { AdminSidebarBrand } from '@/components/admin/admin-sidebar-brand';
import { AdminWorkspaceFilters } from '@/components/admin/admin-workspace-filters';

export function AdminSidebarHeader() {
  return (
    <div className="flex flex-col items-stretch gap-2 border-b border-[hsl(var(--admin-sidebar-border))]/40 px-2 py-2">
      <div className="flex justify-center">
        <AdminSidebarBrand variant="inline" />
      </div>
      <AdminWorkspaceFilters variant="dark" layout="sidebar" className="w-full" />
    </div>
  );
}
