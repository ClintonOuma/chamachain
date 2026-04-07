# ChamaChain

An AI-powered platform for Chamas (informal cooperative savings and lending groups common in East Africa). Combines traditional group finance with blockchain voting, AI credit scoring, and M-Pesa payments.

## Architecture

Multi-service application:

- **Frontend** (`frontend/`) — React + Vite + Tailwind, Zustand state management
- **Backend** (`backend/`) — Node.js/Express API with Socket.io, JWT auth, Mongoose
- **AI Service** (`ai-service/`) — Python FastAPI for credit scoring and group health analysis
- **Blockchain** (`blockchain/`) — Solidity smart contracts (Hardhat) for loan voting on Polygon

## Ports

| Service   | Port |
|-----------|------|
| Frontend  | 5000 |
| Backend   | 8000 |
| AI Service| 8000 (external, not run locally by default) |

## Workflows

- **Start application** — `cd frontend && npm run dev` (port 5000, webview)
- **Backend API** — `cd backend && npm start` (port 8000, console)

## Environment Variables (Required)

Set in Replit Secrets:
- `JWT_ACCESS_SECRET` — JWT signing secret for access tokens
- `JWT_REFRESH_SECRET` — JWT signing secret for refresh tokens
- `MONGODB_URI` — MongoDB Atlas connection string

Set as env vars:
- `PORT=8000` — Backend port
- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:5000`

## Key Integrations

- **MongoDB** — Primary database (via Mongoose)
- **M-Pesa** — Mobile payments (Daraja API, optional)
- **Socket.io** — Real-time notifications
- **Blockchain** — Polygon/Mumbai testnet for loan voting

## Changes Made During Setup

- Updated `frontend/vite.config.js` — Set host to `0.0.0.0`, port to `5000`, `allowedHosts: true` for Replit proxy
- Updated vite proxy target from port 4000 to 8000 to match backend
- Updated `backend/src/server.js` — Set CORS `origin: true` to allow all origins (dev-friendly)
- Fixed duplicate `ScoreGauge` function in `frontend/src/pages/AICoachPage.jsx`
- Backend runs on port 8000 (PORT env var)
