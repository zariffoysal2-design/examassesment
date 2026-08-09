# Deploying: Frontend on Netlify, Backend on Render

This assumes your code is pushed to a GitHub (or GitLab/Bitbucket) repo — both platforms deploy from a connected repo.

---

## 1. Deploy the backend to Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your repo
3. Configure:
   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

   (A `render.yaml` is included in the repo root if you prefer Render's "Blueprint" infra-as-code deploy instead of the manual dashboard steps above.)

4. Add environment variables (**Environment** tab):
   ```
   APP_ENV=production
   TEST_DURATION_MINUTES=60
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_KEY=sb_secret_...
   GEMINI_API_KEY=your-real-key
   GEMINI_MODEL=gemini-2.5-flash
   FRONTEND_URL=https://your-app-name.netlify.app
   ```
   Leave `FRONTEND_URL` as a placeholder for now — you'll fill in the real Netlify URL after step 2, then redeploy.

5. Click **Create Web Service**. Render will build and deploy; you'll get a URL like:
   ```
   https://assessment-backend.onrender.com
   ```
6. Verify: visit `https://assessment-backend.onrender.com/api/health` and `/docs`.

> **Free tier note:** Render's free web services spin down after inactivity and take ~30-60s to wake on the next request. That's expected — not a bug — if the first request after idle time feels slow.

---

## 2. Deploy the frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
2. Connect your repo
3. Netlify should auto-detect the included `netlify.toml` (base directory `frontend`, build command `npm run build`, publish directory `frontend/dist`). If it doesn't auto-apply, set those manually.
4. Add an environment variable (**Site configuration → Environment variables**):
   ```
   VITE_API_URL=https://assessment-backend.onrender.com
   ```
   (use your actual Render URL from step 1)
5. Deploy. You'll get a URL like:
   ```
   https://your-app-name.netlify.app
   ```

---

## 3. Connect them: update backend CORS

Now that you have your real Netlify URL, go back to Render → your backend service → **Environment** → update:
```
FRONTEND_URL=https://your-app-name.netlify.app
```
Save — Render will auto-redeploy. (The backend already allows any `*.netlify.app` subdomain automatically, so Netlify's deploy-preview URLs work too — but the production `FRONTEND_URL` should still be set explicitly.)

---

## 4. Verify the full deployed flow

Same checklist as local, just with your live URLs:
1. `https://assessment-backend.onrender.com/api/health` → OK
2. `https://assessment-backend.onrender.com/api/problems` → 5 problems
3. Open `https://your-app-name.netlify.app` → log in → submit a solution
4. Check Supabase Table Editor → `test_sessions` and `submissions` get new rows
5. Open browser dev tools → Network tab if anything fails — CORS errors show clearly there

---

## 5. Redeploying after code changes

Both platforms auto-deploy on every `git push` to your connected branch by default — no manual redeploy step needed.

## 6. Before going fully public

- `POST /api/problems/generate` still has **no authentication** — anyone who finds that URL can generate/save new problems using your Gemini quota. Add an admin check (e.g. a shared secret header) before sharing the deployed link widely.
- Consider Render's paid tier if the free-tier cold-start delay is a problem for a live exam.
