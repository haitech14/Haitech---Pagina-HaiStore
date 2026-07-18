import { listLanIpv4Addresses } from '../shared/dev-lan.js';

const webPort = Number(process.env.VITE_DEV_PORT ?? 5173);
const apiPort = Number(process.env.ADMIN_PORT ?? 3080);

console.log('\n[HaiStore] URLs de desarrollo (localhost + IP):\n');
console.log(`  Localhost:  http://localhost:${webPort}`);
console.log(`  Loopback:   http://127.0.0.1:${webPort}`);
console.log(`  API local:  http://localhost:${apiPort}  (proxy /api desde Vite)`);
console.log('  Stack:      npm run dev:all  (Vite + API admin)\n');

const ips = listLanIpv4Addresses();
if (ips.length === 0) {
  console.log('  Red/IP:     (sin IPv4 LAN detectada)\n');
} else {
  console.log('  Red/IP (misma Wi‑Fi/Ethernet/Tailscale):');
  for (const ip of ips) {
    console.log(`              http://${ip}:${webPort}`);
  }
  console.log('');
}

console.log('  Firewall Windows (opcional): npm run dev:lan  (como administrador)');
console.log(
  `  Si el puerto ${webPort} está ocupado, libera ese puerto o define VITE_DEV_PORT (strictPort).\n`,
);
