# Esquema Supabase — HaiStore

Aplicar migraciones en orden:

1. `001_profiles_auth.sql` — usuarios y roles (`profiles`)
2. `002_products.sql` — catálogo (`products`)
3. `003_store_customers_orders.sql` — categorías, clientes y pedidos

## Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de auth (rol, email, nombre) |
| `products` | Catálogo con precios por rol (`prices` jsonb) |
| `store_product_categories` | Categorías normalizadas (`slug`, `name`) |
| `store_customers` | Cliente de tienda; `profile_id` opcional |
| `store_orders` | Pedidos con totales USD/PEN y estados |
| `store_order_items` | Líneas con snapshot del producto |

## Estados de pedido (`store_order_status`)

- `pending_payment` — pendiente de pago
- `confirmed` — confirmado
- `processing` — en preparación
- `shipped` — enviado
- `delivered` — entregado
- `cancelled` — cancelado

## Pago (`store_payment_status`)

`pending` | `paid` | `failed` | `refunded`

## API admin (Express)

- `GET /api/orders/admin/dashboard?from=&to=` — KPIs y series
- `GET /api/orders/admin/recent?limit=10`
- `GET /api/customers/admin/all`

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el servidor admin.
