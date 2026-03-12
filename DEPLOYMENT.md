# Backend Deployment Guide

Steps to launch the Happy Neighbor API for production.

## 1. Choose a Hosting Platform

**Railway** (recommended), **Render**, or **Fly.io** all work. The project includes:

- `railway.json` – build and start config
- `Procfile` – process definition

## 2. Deploy the Backend

### Railway

1. Create a project at [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set the root directory (project root)
4. Add environment variables (see below)
5. Deploy; Railway will run `node api-server.js`

### Render

1. New → Web Service
2. Connect repo, set build command: `npm install`
3. Start command: `node api-server.js`
4. Add environment variables

### Fly.io

1. `fly launch` in the project directory
2. Configure `fly.toml` if needed
3. Set secrets: `fly secrets set SESSION_SECRET=xxx FRONTEND_URL=xxx`
4. `fly deploy`

## 3. Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Production frontend URL | `https://your-app.netlify.app` |
| `SESSION_SECRET` | Random string for session signing | `openssl rand -base64 32` |
| `NODE_ENV` | Set to `production` | `production` |

`PORT` is set automatically by most platforms.

## 4. Deploy the Frontend

Host the built React app on **Netlify** or **Vercel**:

1. Connect your repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable for build:
   - `VITE_API_URL` = your backend URL + `/api`  
   - e.g. `https://your-api.railway.app/api`

This makes the frontend use the production API instead of localhost.

## 5. Post-Deploy Checklist

- [ ] Health check: `GET https://your-api.railway.app/` returns JSON
- [ ] CORS: Frontend domain is allowed (set `FRONTEND_URL` correctly)
- [ ] Test survey → results flow from the production frontend
- [ ] Seed data: `POST https://your-api.railway.app/api/dev/seed` (optional)

## 6. Database Notes

- SQLite (`neighborhoods.db`) is used by default
- On Railway/Render, the file system is persistent during the process lifecycle
- Data is lost on full redeploy unless you use a volume
- For long-term production, consider PostgreSQL (requires code changes)

## 7. File Uploads

- Verification document uploads go to `uploads/verifications/`
- On most platforms this storage is ephemeral (lost on redeploy)
- For production uploads, plan to move to S3 or similar storage
