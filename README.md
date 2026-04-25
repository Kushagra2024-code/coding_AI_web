# AI OA Practice

Open-source web platform to simulate coding interviews, online assessments, and system design interviews with AI assistance.

## Monorepo Layout

```
coding_AI_web/
	frontend/
		react-app/
	backend/
		node-server/
	docs/
	infra/
```

## Project Planning

Detailed architecture and delivery plan: [PROJECT_PLAN.md](PROJECT_PLAN.md)

## Planned Stack

- Frontend: React, TypeScript, Tailwind CSS, Zustand, Monaco Editor
- Backend: Node.js, Express.js, MongoDB
- AI: Gemini API
- Code execution: Judge0 API
- Real-time: Socket.io
- Deployment: Vercel (frontend), Render/Railway (backend), MongoDB Atlas

## Setup Instructions

1. Install Node.js `>= 20.18.1` and npm.
2. Install dependencies:

```bash
npm --prefix frontend/react-app install
npm --prefix backend/node-server install
```

3. Copy environment files:

```bash
cp .env.example .env
cp backend/node-server/.env.example backend/node-server/.env
cp frontend/react-app/.env.example frontend/react-app/.env
```

4. Start backend and frontend:

```bash
npm run dev:backend
npm run dev:frontend
```

## Environment Variables

Backend (`backend/node-server/.env`):
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `GEMINI_API_KEY`
- `JUDGE0_API_URL`
- `JUDGE0_API_KEY`

Frontend (`frontend/react-app/.env`):
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

## API (Current Scaffold)

Health endpoint:
- `GET /api/health`

Phase 1 auth/session endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me` (Bearer token required)
- `POST /api/sessions/start` (Bearer token required)
- `POST /api/sessions/end` (Bearer token required)

Phase 2 coding workflow endpoints:
- `GET /api/questions` (Bearer token required)
- `GET /api/questions/:questionId` (Bearer token required)
- `POST /api/submit-code` (Bearer token required)

Planned core endpoints (currently scaffolded with `501 Not Implemented`):
- `POST /api/generate-question`
- `POST /api/evaluate-design`
- `POST /api/detect-cheating`
- `POST /api/generate-feedback`
- `GET /api/session-score`
- `GET /api/analytics`

## Deployment (Free Tier)

1. Frontend deploy on Vercel using `frontend/react-app` as root.
2. Backend deploy on Render or Railway using `backend/node-server`.
3. Database on MongoDB Atlas free tier.
4. Set environment variables in each platform dashboard.

More details in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
