# Aura Jewels - Zero-Cost Deployment Guide ($0 / Month)

Follow these exact steps to deploy the backend to Cloudflare Workers (with D1 SQLite) and the frontend to Cloudflare Pages.

---

### Prerequisites
1. Free [Cloudflare Account](https://dash.cloudflare.com).
2. Free [GitHub Account](https://github.com).
3. Node.js (v18+) installed on your computer.

---

### Step 1: Deploy Backend Worker & D1 Database

1. Navigate to the API folder and authenticate Wrangler:
   ```bash
   cd services/api
   npm install
   npx wrangler login
   ```

2. Create the production Cloudflare D1 database:
   ```bash
   npx wrangler d1 create aura-jewels-db
   ```
   *Wrangler will output something like:*
   ```text
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

3. Open `services/api/wrangler.jsonc` and paste that `database_id` into the `d1_databases` array.

4. Apply the SQL schema and seed data to your production D1 database:
   ```bash
   npx wrangler d1 migrations apply aura-jewels-db --remote
   npx wrangler d1 execute aura-jewels-db --remote --file=./seeds/seed.sql
   ```

5. Deploy the Worker:
   ```bash
   npm run deploy
   ```
   Note your live Worker URL (e.g., `https://aura-jewels-api.your-subdomain.workers.dev`).

---

### Step 2: Configure & Deploy Frontend to Cloudflare Pages

1. In `apps/web/src/environments/environment.prod.ts`, update `apiUrl` with your live Worker URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://aura-jewels-api.your-subdomain.workers.dev/api'
   };
   ```

2. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete aura jewels catalogue"
   git branch -M main
   git remote add origin https://github.com/<your-username>/aura-jewels.git
   git push -u origin main
   ```

3. In Cloudflare Dashboard:
   - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select your `aura-jewels` repository.
   - Configure build settings:
     - **Framework preset**: `Angular`
     - **Root directory**: `apps/web`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist/aura-jewels-web/browser` (or `dist/aura-jewels-web`)
   - Click **Save and Deploy**.

---

### Step 3: Verify Live Deployment
- Open your custom `*.pages.dev` URL on your mobile browser.
- Verify product cards and filters.
- Tap a piece to inspect deep linking (`/products/aur-9281`). Refresh the page to verify that the SPA fallback (`_redirects`) resolves cleanly without 404 errors.
- Test the native "Share Piece" button on your phone.
