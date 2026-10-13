# Deploying ScopeSentry to Cloudflare Pages

This guide covers deploying ScopeSentry to Cloudflare Pages. The application is configured with SPA client-side routing, Cloudflare Pages Edge Functions, asset caching headers, and Cloudflare Tunnel integration.

---

## What Has Been Configured

1. **SPA Routing (`client/public/_redirects`)**:
   - `/*  /index.html  200` ensures all client-side paths (`/projects`, `/compare`, etc.) resolve seamlessly on reload.
2. **Edge Asset Caching (`client/public/_headers`)**:
   - Long-lived cache headers and HTTP security headers for `/hero-bg.mp4`, `/hero-bg.webp`, and bundled chunks across Cloudflare's global edge network.
3. **Cloudflare Edge Functions (`functions/api/[[route]].ts`)**:
   - Edge serverless handlers for `/api/health`, `/api/models`, `/api/agreements/analyze`, `/api/compare`, and `/api/replies/draft`.
   - The application functions immediately when visited online, even if no local backend is connected.
4. **Wrangler Configuration (`wrangler.json` & `wrangler.toml`)**:
   - Ready for CLI deployment and preview via Wrangler.
5. **Configurable Remote Backend in Settings**:
   - The UI includes a **Backend Endpoint & Cloudflare Tunnel** setting so you can route live AI inference to your local Ollama machine securely.

---

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build:pages`
   - **Build output directory**: `client/dist`
   - **Root directory**: `/` (leave blank or set to `/`)
5. Click **Save and Deploy**.

Cloudflare will build and deploy the application to a `*.pages.dev` domain with free SSL.

---

## Option 2: Deploy via Wrangler CLI

You can deploy directly from your local terminal:

```bash
# 1. Build the production bundle
npm run build:pages

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy client/dist --project-name=scopesentry
```

If it is your first time using Wrangler, it will open a browser window for a one-time Cloudflare login.

---

## Connecting Your Local Ollama Engine to Cloudflare

Because ScopeSentry is local-first, you can connect your Cloudflare-hosted frontend to your local computer's Ollama engine without opening router ports using **Cloudflare Tunnel**:

### Step 1: Install `cloudflared` on Windows
```powershell
winget install Cloudflare.cloudflared
```

### Step 2: Start a Quick Tunnel to the Local ScopeSentry Backend
In PowerShell, run:
```powershell
cloudflared tunnel --url http://127.0.0.1:3001
```
Cloudflare will output a public HTTPS URL like:
```
https://random-words-here.trycloudflare.com
```

### Step 3: Enter the URL in ScopeSentry Settings
1. Open your deployed Cloudflare Pages site.
2. Go to **Local AI Settings** (or click the status badge in the header).
3. Under **Backend Endpoint & Cloudflare Tunnel**, paste your tunnel URL (e.g. `https://random-words-here.trycloudflare.com`) and click **Save Endpoint**.

The deployed site will immediately use your local machine's GPU for Ollama inference while remaining accessible from any phone, tablet, or browser.
