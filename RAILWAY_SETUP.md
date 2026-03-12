# Railway Setup – Step by Step

## 1. Create a Railway Account
1. Go to **https://railway.app**
2. Click **Login** → **Sign in with GitHub**
3. Authorize Railway to access your GitHub

---

## 2. Create a New Project
1. Click **New Project**
2. Choose **Deploy from GitHub repo**
3. Pick your HappyNeighbor repo (or fork it first if it’s not in your account)
4. Railway will create a new project and try to deploy

---

## 3. Set Your Domain
1. Click your new service (the deployed app)
2. Go to **Settings** → **Networking** → **Public Networking**
3. Click **Generate Domain**
4. Copy the URL, e.g. `https://happyneighbor-production-xxxx.up.railway.app`

---

## 4. Add Environment Variables
1. With the service selected, open the **Variables** tab
2. Click **+ New Variable**
3. Add these three variables:

| Name | Value |
|------|--------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | Any long random string (e.g. `my-super-secret-key-12345-change-this`) |
| `FRONTEND_URL` | Your frontend URL, e.g. `http://localhost:3000` for now; update later to your live site |

4. Click **Add** for each one
5. Railway will redeploy after variables are saved

---

## 5. Check It’s Working
1. Open the generated URL (e.g. `https://happyneighbor-production-xxxx.up.railway.app`)
2. You should see: `{"status":"ok","message":"🏠 Happy Neighbor API is running!"...}`

---

## 6. Connect Your Frontend
When your frontend is on Netlify/Vercel (or wherever):

1. In that hosting’s environment settings, add:
   - **Variable:** `VITE_API_URL`  
   - **Value:** `https://your-railway-url.up.railway.app/api`
2. Redeploy the frontend

Also set `FRONTEND_URL` in Railway to your live frontend URL (e.g. `https://your-app.netlify.app`).

---

**That’s it.** Your backend will be live at the Railway URL. If anything fails, check the **Deployments** tab for logs.
