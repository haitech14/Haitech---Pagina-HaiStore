# AGENTS.md

## Cursor Cloud specific instructions

HaiStore is a single-app Vite + React storefront with an Express admin API (`server/`). Prefer `npm run dev:all` so Vite (`:5173`) and the API (`:3080`, proxied as `/api`) run together. Standard scripts and setup are in `README.md` / `package.json`.

### Runtime caveats

- **Catalog source:** `.env` may set `HAISTORE_CATALOG_SOURCE=supabase`. If Supabase lacks the `products` table (API logs: `Tabla products no encontrada`), the API still serves a local/file inventory fallback — storefront and home-bundle keep working. Full DB-backed E2E needs migrations under `supabase/migrations/` (see `supabase/README.md`) and a successful `npm run sync:supabase`.
- **Auth:** Demo login works without working Supabase Auth via `POST /api/auth/login-demo` (UI login page). Shared accounts/passwords are documented in `shared/haitech-auth-credentials.json` and `.env.example` (e.g. `admin@haitech.pe` / `admin123`). Supabase Auth is used when the project is fully configured.
- **Optional integrations:** Culqi, Mercado Pago, HaiSupport outbound sync, and Google Drive media are optional for local storefront/admin work. `GET /api/integrations/health` reports connection status.
- **No automated test suite:** There is no `npm test`. Quality gates are `npm run lint`, `npm run typecheck`, and `npm run build`. `npm run lint` currently reports many pre-existing findings; `npm run typecheck` is the cleaner compile check.
- **Do not commit runtime snapshots:** Starting the API can refresh files under `public/catalog/` (e.g. home-bundle / inventory-index). Leave those out of commits unless intentionally regenerating snapshots.
