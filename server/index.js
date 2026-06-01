import 'dotenv/config';

import app from './app.js';

const PORT = process.env.ADMIN_PORT ?? 3080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] HaiStore admin escuchando en http://localhost:${PORT} (red: 0.0.0.0:${PORT})`);
});
