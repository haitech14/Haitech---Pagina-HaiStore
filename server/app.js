import express from 'express';
import compression from 'compression';
import cors from 'cors';

import { getCorsOrigins, isCorsOriginAllowed } from './lib/cors-origins.js';
import { shouldPreferSupabaseCatalog } from './lib/catalog-source.js';
import { getHaiSalesSupabaseAdmin } from './lib/haisales-supabase.js';
import { getHaiSupportSupabaseAdmin } from './lib/haisupport-supabase.js';
import {
  probeHaiSalesConnection,
  probeHaiSupportConnection,
} from './lib/haitech-integrations-config.js';
import { getSupabaseAdmin, isSupabaseAuthEnabled } from './lib/supabase-auth.js';
import { MAX_PRODUCT_UPLOAD_JSON_BODY } from '../shared/product-media-upload-limits.js';
import { supportRouter } from './routes/support.js';
import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import { settingsRouter } from './routes/settings.js';
import { ordersRouter } from './routes/orders.js';
import { customersRouter } from './routes/customers.js';
import { categoriesRouter } from './routes/categories.js';
import { brandsRouter } from './routes/brands.js';
import { warehousesRouter } from './routes/warehouses.js';
import { proformasRouter } from './routes/proformas.js';
import { rentalPlansRouter } from './routes/rental-plans.js';
import { rentalRequestsRouter } from './routes/rental-requests.js';
import { serviceRequestsRouter } from './routes/service-requests.js';
import { integrationsRouter } from './routes/integrations.js';
import { salesReportsRouter } from './routes/sales-reports.js';
import { forumRouter } from './routes/forum.js';
import { mediaAlbumRouter } from './routes/media-album.js';
import { couponsRouter } from './routes/coupons.js';
import { checkoutRouter, webhooksRouter } from './routes/checkout.js';

const corsOrigins = getCorsOrigins();

const app = express();

app.use(compression());
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
app.use(express.json({ limit: MAX_PRODUCT_UPLOAD_JSON_BODY }));
app.use(express.urlencoded({ extended: true, limit: MAX_PRODUCT_UPLOAD_JSON_BODY }));

app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', async (_req, res) => {
  let catalogProducts = null;
  let catalogError = null;
  let catalogHint = null;
  let integrations = null;

  if (isSupabaseAuthEnabled()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: probeRow, error: probeError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      if (probeError) {
        catalogError = probeError.message;
      } else {
        const { count, error } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true });
        if (error) catalogError = error.message;
        else catalogProducts = count ?? (probeRow?.length ?? 0);
      }

      if (!catalogError && catalogProducts === 0 && shouldPreferSupabaseCatalog()) {
        catalogHint =
          'Catálogo vacío en Supabase. Ejecuta npm run sync:supabase y verifica SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en Vercel (mismo proyecto que haistore.vercel.app).';
      }

      const [haisupport, haisales] = await Promise.all([
        probeHaiSupportConnection(getHaiSupportSupabaseAdmin(), getSupabaseAdmin()),
        probeHaiSalesConnection(getHaiSalesSupabaseAdmin()),
      ]);
      integrations = { haisupport, haisales };
    } catch (error) {
      catalogError = error instanceof Error ? error.message : 'unknown';
    }
  } else if (process.env.VERCEL) {
    catalogHint =
      'Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel. El disco serverless es efímero; el catálogo debe vivir en Supabase.';
  }

  res.json({
    status: 'ok',
    service: 'haistore-admin',
    ts: new Date().toISOString(),
    vercel: Boolean(process.env.VERCEL),
    catalogSource: shouldPreferSupabaseCatalog() ? 'supabase' : 'file',
    catalogProducts,
    catalogError,
    catalogHint,
    integrations,
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
app.use('/api/integrations', integrationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/customers', customersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/proformas', proformasRouter);
app.use('/api/rental-plans', rentalPlansRouter);
app.use('/api/rental-requests', rentalRequestsRouter);
app.use('/api/service-requests', serviceRequestsRouter);
app.use('/api/sales-reports', salesReportsRouter);
app.use('/api/forum', forumRouter);
app.use('/api/media-album', mediaAlbumRouter);
app.use('/api/coupons', couponsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

function resolveApiErrorStatus(message) {
  if (
    /catálogo vacío|supabase no configurado|migraci[oó]n|tabla products no encontrada/i.test(
      message,
    )
  ) {
    return 503;
  }
  if (
    /categoría no encontrada|elimina primero|padre no es válida|no se puede asignar|orden inválido/i.test(
      message,
    )
  ) {
    return 400;
  }
  return 500;
}

function resolveApiErrorBody(message, isProductRoute, err) {
  // Solo body JSON inválido del cliente (express.json), no SyntaxError al leer inventory.json.
  if (err?.type === 'entity.parse.failed') {
    return isProductRoute ? 'Datos del producto inválidos' : 'Datos de la solicitud inválidos';
  }
  if (
    /catálogo vacío|supabase|migraci[oó]n|tabla products no encontrada|categoría no encontrada|elimina primero|padre no es válida|no se puede asignar|orden inválido/i.test(
      message,
    )
  ) {
    return message;
  }
  return 'Error interno del servidor';
}

app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error:
        'El producto es demasiado grande (suele ser por imágenes pegadas). Usa URLs o archivos más livianos.',
    });
  }
  if (err.type === 'entity.parse.failed') {
    const isProductRoute = _req.path?.startsWith('/api/products');
    return res.status(400).json({
      error: resolveApiErrorBody(err.message ?? '', isProductRoute, err),
    });
  }
  const message = typeof err.message === 'string' ? err.message : 'Error interno del servidor';
  const isProductRoute = _req.path?.startsWith('/api/products');
  res.status(resolveApiErrorStatus(message)).json({
    error: resolveApiErrorBody(message, isProductRoute, err),
  });
});

export default app;
