# Deployment Guide (Free Tier)

## Frontend (Vercel)

1. Create a new Vercel project and point it to the repository.
2. Set root directory to `frontend/react-app`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_SOCKET_URL`

## Backend (Render or Railway)

1. Create a new web service from the same repository.
2. Set root directory to `backend/node-server`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm run start`.
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `GEMINI_API_KEY`
   - `JUDGE0_API_URL`
   - `JUDGE0_API_KEY`

## Database (MongoDB Atlas)

1. Create a free cluster.
2. Create database user and password.
3. Add backend host IP allow-list (or temporary `0.0.0.0/0` for bootstrap).
4. Copy connection string to `MONGODB_URI`.

## Post-Deployment Checklist

1. Confirm `/api/health` returns `200`.
2. Confirm frontend can call backend over CORS.
3. Verify socket handshake succeeds.
4. Add custom domain and HTTPS.
