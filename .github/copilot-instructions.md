# Aura Jewels — Copilot Agent Workspace Instructions

You are assisting a developer deploying **Aura Jewels**, a zero-cost, read-only mobile-first jewellery catalogue.

## Repository Layout
- `apps/web`: Angular 19+ standalone application (built with `npm run build`, output at `dist/aura-jewels-web/browser`).
- `services/api`: Cloudflare Worker TypeScript API using `itty-router` and Cloudflare D1 SQLite (`wrangler.jsonc`).
- `services/api/migrations/0001_initial_schema.sql`: Database schema.
- `services/api/seeds/seed.sql`: Sample jewellery products.
- `apps/web/public/_redirects`: Cloudflare Pages SPA fallback rule (`/* /index.html 200`).

## Deployment Rules
1. Never introduce paid services or paid custom domains. Stay strictly within Cloudflare's $0 free tier.
2. When deploying the backend:
   - Run `npx wrangler login` (guide the user to open the login link in their browser).
   - Run `npx wrangler d1 create aura-jewels-db`, extract the `database_id`, and write it into `services/api/wrangler.jsonc`.
   - Apply migrations and seed data remotely (`--remote`).
   - Run `npm run deploy` inside `services/api` and capture the `*.workers.dev` URL.
3. When connecting the frontend:
   - Update `apiUrl` inside `apps/web/src/environments/environment.prod.ts` to `<WORKER_URL>/api`.
   - Verify production build succeeds via `cd apps/web && npm run build`.
   - Commit and push changes to GitHub so Cloudflare Pages can build automatically.
