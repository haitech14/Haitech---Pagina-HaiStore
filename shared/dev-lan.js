import os from 'node:os';

/**
 * IPv4 no internas de la máquina (Wi‑Fi/Ethernet/Tailscale).
 * Usado por el script de URLs de desarrollo y por CORS en LAN.
 */
export function listLanIpv4Addresses() {
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

/**
 * Orígenes http(s) típicos de Vite en localhost + cada IP LAN.
 * @param {number} [webPort=5173]
 */
export function listDevWebOrigins(webPort = 5173) {
  const port = Number(webPort) || 5173;
  const origins = new Set([
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);
  for (const ip of listLanIpv4Addresses()) {
    origins.add(`http://${ip}:${port}`);
  }
  return [...origins];
}
