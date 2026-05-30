import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { supportRouter } from './routes/support.js';
import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import { settingsRouter } from './routes/settings.js';

const app = express();
const PORT = process.env.ADMIN_PORT ?? 3080;

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const lanOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):5173$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin) || lanOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json());

// Log básico de peticiones.
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'haistore-admin', ts: new Date().toISOString() });
});

app.use('/api/support', supportRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);

// Manejo de rutas no encontradas.
app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Manejo de errores.
app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] HaiStore admin escuchando en http://localhost:${PORT} (red: 0.0.0.0:${PORT})`);
});
