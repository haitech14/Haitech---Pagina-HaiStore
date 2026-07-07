import os from 'node:os';

const webPort = Number(process.env.VITE_DEV_PORT ?? 5173);
const apiPort = Number(process.env.ADMIN_PORT ?? 3080);
const locale = process.env.HAISTORE_DEV_LOCALE ?? 'es-PE';

function listLanIps() {
  const ips = new Set();
  for (const interfaces of Object.values(os.networkInterfaces())) {
    if (!interfaces) continue;
    for (const iface of interfaces) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      ips.add(iface.address);
    }
  }
  return [...ips];
}

function getLocalTimeInfo(date = new Date()) {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  const timeZone = formatter.resolvedOptions().timeZone;

  return {
    formattedTime: formatter.format(date),
    timeZone,
  };
}

const { formattedTime, timeZone } = getLocalTimeInfo();

console.log('\n[HaiStore] Desarrollo local activo:\n');
console.log(`  Hora:    ${formattedTime}`);
console.log(`  Zona:    ${timeZone}`);
console.log(`  Local:   http://localhost:${webPort}`);
console.log(`  API:     http://localhost:${apiPort} (proxy /api desde Vite)`);
console.log('  Stack:   npm run dev:all  (Vite + API admin)\n');

const ips = listLanIps();
if (ips.length === 0) {
  console.log('  Red:     (sin IPv4 LAN detectada)\n');
} else {
  console.log('  IP/Red (misma Wi-Fi/Ethernet):');
  for (const ip of ips) {
    console.log(`           http://${ip}:${webPort}`);
  }
  console.log('');
}

console.log('  Firewall Windows (opcional): npm run dev:lan  (como administrador)');
console.log(`  Si el puerto ${webPort} está ocupado, cierra el proceso anterior antes de reiniciar.\n`);
