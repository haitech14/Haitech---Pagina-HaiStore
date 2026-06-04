import { Navigate, useParams } from 'react-router-dom';

import { SettingsPanel } from '@/components/admin/settings-panel';
import { ADMIN_SETTINGS_SECTIONS, type AdminSettingsSectionId } from '@/lib/admin-routes';

function parseSection(value: string | undefined): AdminSettingsSectionId | null {
  if (value && (ADMIN_SETTINGS_SECTIONS as readonly string[]).includes(value)) {
    return value as AdminSettingsSectionId;
  }
  return null;
}

export function AdminConfiguracionSectionPage() {
  const { section } = useParams<{ section: string }>();
  const parsed = parseSection(section);

  if (!parsed) {
    return <Navigate to="/admin/configuracion/general" replace />;
  }

  return <SettingsPanel section={parsed} />;
}
