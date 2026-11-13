# Aura Jewels - Public Jewellery Catalogue

A mobile-first, ultra-fast, zero-cost read-only public jewellery product catalogue built with Angular 19+ and Cloudflare Workers + D1 SQLite.

## Project Structure
- `apps/web`: Angular frontend (Standalone, Signals, Tailwind/Material-inspired responsive mobile design).
- `services/api`: Cloudflare Worker TypeScript API querying Cloudflare D1.

## Quickstart & Local Dev
1. **Install Dependencies**:
   ```bash
   cd services/api && npm install
   cd ../../apps/web && npm install
   ```

2. **Run Local Database & API**:
   ```bash
   cd services/api
   npx wrangler d1 migrations apply aura-jewels-db --local
   npx wrangler d1 execute aura-jewels-db --local --file=./seeds/seed.sql
   npm run dev
   ```
   API runs at `http://127.0.0.1:8787`.

3. **Run Frontend**:
   ```bash
   cd apps/web
   npm start
   ```
   Frontend runs at `http://localhost:4200`.
