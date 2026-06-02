import express from 'express';
import cors from 'cors';

import { getCorsOrigins, isCorsOriginAllowed } from './lib/cors-origins.js';
import { supportRouter } from './routes/support.js';
import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import { settingsRouter } from './routes/settings.js';
import { ordersRouter } from './routes/orders.js';
import { customersRouter } from './routes/customers.js';
import { categoriesRouter } from './routes/categories.js';
import { warehousesRouter } from './routes/warehouses.js';
import { proformasRouter } from './routes/proformas.js';

const corsOrigins = getCorsOrigins();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (isCorsOriginAllowed(origin, corsOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'haistore-admin',
    ts: new Date().toISOString(),
    vercel: Boolean(process.env.VERCEL),
  });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'haistore-admin',
    status: 'ok',
    endpoints: {
      health: '/api/health',
    },
  });
});

app.use('/api/support', supportRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/proformas', proformasRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error:
        'El producto es demasiado grande (suele ser por imágenes pegadas). Usa URLs o archivos más livianos.',
    });
  }
  const message = typeof err.message === 'string' ? err.message : 'Error interno del servidor';
  res.status(500).json({
    error: message.includes('JSON') ? 'Datos del producto inválidos' : 'Error interno del servidor',
  });
});

export default app;
