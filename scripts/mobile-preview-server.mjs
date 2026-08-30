/**
 * Visor móvil en marco de celular (iframe → Vite dev).
 * Uso: npm run dev:mobile-preview
 */
import http from 'node:http';
import os from 'node:os';

const previewPort = Number(process.env.VITE_MOBILE_PREVIEW_PORT ?? 5176);
const appPort = Number(process.env.VITE_DEV_PORT ?? 5173);

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

function buildHtml() {
  const appUrl = `http://localhost:${appPort}`;
  const lanIps = listLanIps();
  const lanHint =
    lanIps.length > 0
      ? `<p class="hint">En tu celular (misma red): <code>${lanIps.map((ip) => `http://${ip}:${appPort}`).join(' · ')}</code></p>`
      : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HaiStore — vista móvil</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(ellipse at 50% 0%, #2a2a2e 0%, #0d0d0f 55%);
      color: #e8e8ea;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 32px;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .sub {
      margin: 0 0 20px;
      font-size: 0.8125rem;
      color: #9ca3af;
      text-align: center;
      max-width: 36rem;
    }
    .sub code {
      background: #1f2937;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .hint {
      margin: 0 0 16px;
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
      max-width: 32rem;
      line-height: 1.5;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
    }
    .toolbar button {
      border: 1px solid #374151;
      background: #1f2937;
      color: #f3f4f6;
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .toolbar button:hover { background: #374151; }
    .toolbar button.active {
      background: #E30613;
      border-color: #E30613;
    }
    .stage {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .phone {
      position: relative;
      width: var(--phone-w, 390px);
      padding: 14px;
      border-radius: 44px;
      background: linear-gradient(145deg, #1c1c1e 0%, #0a0a0b 100%);
      box-shadow:
        0 0 0 2px #2c2c2e,
        0 0 0 6px #0a0a0b,
        0 24px 64px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .phone::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 28px;
      background: #000;
      border-radius: 20px;
      z-index: 2;
      box-shadow: inset 0 0 0 1px #222;
    }
    .screen {
      position: relative;
      width: 100%;
      height: var(--phone-h, 844px);
      border-radius: 32px;
      overflow: hidden;
      background: #fff;
      border: 1px solid #111;
    }
    .screen iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      background: #fff;
    }
    .home-bar {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.35);
      z-index: 2;
      pointer-events: none;
    }
    .side-btn {
      position: absolute;
      background: #2c2c2e;
      border-radius: 2px;
    }
    .side-btn.vol-up { left: -3px; top: 120px; width: 3px; height: 44px; }
    .side-btn.vol-down { left: -3px; top: 174px; width: 3px; height: 44px; }
    .side-btn.power { right: -3px; top: 140px; width: 3px; height: 64px; }
  </style>
</head>
<body>
  <h1>HaiStore — vista móvil</h1>
  <p class="sub">Marco de celular apuntando a <code>${appUrl}</code> · visor en puerto <code>${previewPort}</code></p>
  ${lanHint}
  <div class="toolbar" role="group" aria-label="Tamaño de dispositivo">
    <button type="button" data-w="390" data-h="844" class="active">iPhone 14</button>
    <button type="button" data-w="360" data-h="780">Android</button>
    <button type="button" data-w="375" data-h="667">iPhone SE</button>
    <button type="button" data-w="430" data-h="932">iPhone 15 Pro Max</button>
  </div>
  <div class="stage">
    <div class="phone" id="phone" style="--phone-w: 390px; --phone-h: 844px;">
      <div class="side-btn vol-up" aria-hidden="true"></div>
      <div class="side-btn vol-down" aria-hidden="true"></div>
      <div class="side-btn power" aria-hidden="true"></div>
      <div class="screen">
        <iframe
          id="app"
          src="${appUrl}"
          title="HaiStore móvil"
          allow="clipboard-write"
        ></iframe>
        <div class="home-bar" aria-hidden="true"></div>
      </div>
    </div>
  </div>
  <script>
    const phone = document.getElementById('phone');
    const buttons = document.querySelectorAll('.toolbar button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        phone.style.setProperty('--phone-w', btn.dataset.w + 'px');
        phone.style.setProperty('--phone-h', btn.dataset.h + 'px');
      });
    });
  </script>
</body>
</html>`;
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(buildHtml());
});

server.listen(previewPort, '0.0.0.0', () => {
  console.log('\n[HaiStore] Vista móvil (marco celular):\n');
  console.log(`  Visor:   http://localhost:${previewPort}`);
  console.log(`  App:     http://localhost:${appPort} (dentro del marco)\n`);
  console.log('  Asegúrate de tener npm run dev:all en otro terminal.\n');
});
