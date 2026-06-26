import {
  FolderUp,
  MonitorSmartphone,
  Network,
  Shield,
  Terminal,
  Upload,
  type LucideIcon,
} from 'lucide-react';

export interface SupportDownloadItem {
  id: string;
  name: string;
  description: string;
  fileName: string;
  href: string;
  icon: LucideIcon;
  accentClass: string;
}

export const SUPPORT_DOWNLOADS_INTRO = {
  title: 'Descargas de soporte',
  description:
    'Utilidades recomendadas por HaiTech para asistencia remota, diagnóstico de red y transferencia de archivos.',
};

export const SUPPORT_DOWNLOAD_ITEMS: SupportDownloadItem[] = [
  {
    id: 'teamviewer',
    name: 'TeamViewer',
    description: 'Acceso remoto seguro para soporte técnico asistido.',
    fileName: 'TeamViewer_Setup.exe',
    href: '/descargas/TeamViewer_Setup.exe',
    icon: MonitorSmartphone,
    accentClass: 'bg-[#0E8EE9]/15 text-[#0E8EE9]',
  },
  {
    id: 'anydesk',
    name: 'AnyDesk',
    description: 'Conexión remota rápida y liviana para soporte en línea.',
    fileName: 'AnyDesk.exe',
    href: '/descargas/AnyDesk.exe',
    icon: MonitorSmartphone,
    accentClass: 'bg-[#EF443B]/15 text-[#EF443B]',
  },
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'Herramienta para revisar y configurar reglas de firewall.',
    fileName: 'Firewall.exe',
    href: '/descargas/Firewall.exe',
    icon: Shield,
    accentClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  {
    id: 'ip-scan-advanced',
    name: 'IP Scan Advanced',
    description: 'Escaneo avanzado de dispositivos y direcciones IP en red.',
    fileName: 'IPScanAdvanced.exe',
    href: '/descargas/IPScanAdvanced.exe',
    icon: Network,
    accentClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  },
  {
    id: 'ftp-utility',
    name: 'FTP Utility',
    description: 'Cliente FTP para envío y recepción de archivos.',
    fileName: 'FTPUtility.exe',
    href: '/descargas/FTPUtility.exe',
    icon: FolderUp,
    accentClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  },
  {
    id: 'quick-n-easy-ftp',
    name: 'Quick n Easy FTP',
    description: 'Transferencia FTP simple para respaldos y archivos.',
    fileName: 'QuickNEasyFTP.exe',
    href: '/descargas/QuickNEasyFTP.exe',
    icon: Upload,
    accentClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'putty',
    name: 'PuTTY',
    description: 'Cliente SSH y Telnet para administración de equipos.',
    fileName: 'putty.exe',
    href: '/descargas/putty.exe',
    icon: Terminal,
    accentClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  },
];
