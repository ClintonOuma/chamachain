# ChamaChain — AI Powered Chama Platform

## Deployed login / signup checklist

**Frontend (Render static site):** root `frontend`, build `npm run build`, output `dist`. The default production API origin is in `frontend/.env.production` (`VITE_API_URL`). You can still override with the same key in the Render **Environment** UI.

### Backend (Railway, Render, etc.)

Set:

- `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (required).
- `PORT` is usually provided by the host; do not hardcode unless needed.

**CORS (default):** the API uses `cors({ origin: true })`, so any site Origin your browser sends is echoed back. You normally **do not** need `FRONTEND_URL` for auth to work. To lock down to specific origins instead, set `CORS_STRICT=true` and list URLs in `FRONTEND_URL` or `CORS_ORIGINS` (comma-separated).

Set `trust proxy` is enabled for reverse proxies (Railway, etc.).

### Frontend (Vercel, Netlify, Render, etc.)

At **build** time, set (or rely on `frontend/.env.production` in this repo):

- `VITE_API_URL` = public **origin of your API only** (no `/api/v1`, no trailing slash).  
  This project’s deployed API: `https://chamachain-backend.onrender.com`

If the host strips env vars or you cannot rebuild, edit `frontend/public/runtime-config.js`, uncomment the sample line, set the same URL, redeploy.

Rebuild/redeploy the frontend after any change to `VITE_API_URL`.
