# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

LalaShop / Soshop is a multi-service wholesale e-commerce + social ("SupplyGram") platform. Four independent Node services live side-by-side at the repo root, each with its own `package.json` and `node_modules`:

| Service | Stack | Default port | Role |
|---------|-------|--------------|------|
| `backend/` | Express 4 + Mongoose 8 + TypeScript | 5000 | Single REST API for all clients |
| `frontend/` | Next.js 14.2 (Pages Router) + TS + Tailwind | 3000 | Customer storefront, social feed, profiles |
| `Admin/` | Next.js 14.2 (Pages Router) + TS + Tailwind | 3001 | Internal admin dashboard (users, KYC, shops, withdrawals) |
| `seller/` | Next.js 14.2 (Pages Router) + TS + Tailwind | 3002 (set in `package.json`) | Seller Center (orders, products, finance, marketing, support) |

There is no monorepo tool (no workspaces/turbo/nx). Run scripts from each service's directory.

## Common Commands

Backend (run from `backend/`):
```bash
npm install
npm run dev      # nodemon src/app.ts
npm run build    # tsc → dist/
npm start        # node dist/app.js
```

Each Next.js service (`frontend/`, `Admin/`, `seller/`) exposes the same scripts:
```bash
npm install
npm run dev      # next dev (seller forces -p 3002)
npm run build
npm start
npm run lint     # next lint
```

There is no test runner configured in any service yet — do not assume a `test` script exists.

## Architecture Notes

### API surface (backend/src/app.ts)
All routes are mounted under `/api`:
- `/api/auth` — JWT login/register, Passport Google + Facebook OAuth, 2FA via `otplib` + `qrcode`
- `/api/users`, `/api/products`, `/api/orders`, `/api/cart`
- `/api/posts` — SupplyGram social posts
- `/api/bank`, `/api/address`

Layering: `routes/ → controllers/ → models/ (Mongoose)`. A thin `services/` layer holds cross-cutting logic (currently `paymentService.ts`). MongoDB connection string comes from `MONGODB_URI` in a `.env` file loaded by `dotenv` at the top of `app.ts`.

`authRoutes` is currently mounted twice in `app.ts` (line 37 and line 45) — preserve or fix intentionally, don't delete blindly.

### Client → backend wiring
- **Frontend only**: `frontend/next.config.js` rewrites `/api/:path*` → `http://localhost:5000/api/:path*`. All client code calls relative `/api/...` URLs and assumes this proxy.
- **Admin** (`next.config.mjs`) and **seller** have no rewrite configured. If you add API calls there, either add a rewrite or call the backend directly with an absolute URL/env-driven base.
- Auth tokens are read from `localStorage["token"]` and sent as `Authorization: Bearer <token>` (see `frontend/src/services/api.ts` and `apiClient.ts`). The `apiClient` defensively treats the strings `"undefined"` and `"null"` as missing tokens — keep that guard if you refactor.

### Frontend page structure
`frontend/src/pages/` is a Pages-Router tree organized by domain (`products/`, `cart/`, `orders/`, `social/`, `posts/`, `profile/`, `me/`, `creator/`, `top-factories/`, `new-arricals/` [sic], `Notificatio` [sic]). Preserve the existing folder spellings — there are imports referring to them.

`Admin/src/pages/` and `seller/src/pages/` follow the same Pages-Router convention. Both use a shared `components/{Header,Layout,Sidebar}` triad as the dashboard chrome.

### Styling
Tailwind CSS in all three Next apps. The frontend follows an "Instagram-style" aesthetic for social surfaces and is mobile-first / landscape-optimized — keep that visual direction when touching customer UI.

## Conventions to Respect

- **Pages Router, not App Router.** Do not introduce `app/` directories or React Server Components into existing services without an explicit migration plan.
- **API path discipline.** Always call backend through `/api/...` from `frontend/`. Adding a new backend endpoint means: add a model in `backend/src/models/`, controller in `controllers/`, route file in `routes/`, then mount it in `app.ts`.
- **`.env` files are gitignored** at every level (`**/.env*`). The backend expects at minimum `MONGODB_URI` and `PORT`; auth/2FA features additionally need JWT, OAuth, nodemailer, and otplib secrets — check the controller you're touching for the specific `process.env.*` it reads.
- **TypeScript everywhere except a few stray `.js` files** in `frontend/src/components/` (`GlobalLoading.js`) and `frontend/LoadingContext.js`. New code should be `.ts`/`.tsx`.
- **Shell on this machine is bash on Windows** — use forward slashes and Unix syntax, not PowerShell.

## Reference Docs

`GEMINI.md` (root and `frontend/`) contains an earlier project overview written for Gemini. It is largely accurate for backend + frontend but predates the `seller/` service and its claim that "Admin proxies `/api` to the backend" is **not** currently true (no rewrite in `Admin/next.config.mjs`).
