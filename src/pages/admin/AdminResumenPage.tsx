import { useSearchParams } from 'react-router-dom';

import { AdminResumenDashboard } from '@/components/admin/resumen/admin-resumen-dashboard';

export function AdminResumenPage() {
  const [searchParams] = useSearchParams();
  const vista = searchParams.get('vista') ?? 'general';

  return <AdminResumenDashboard vista={vista} />;
}
