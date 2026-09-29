# Deploying RESQ-GRID on Render (render.com)

This project has been pre-configured for **1-click zero-config deployment on Render**.

---

### Step 1: Push your project to GitHub

Open a terminal or command prompt in `f:\resqgrid` and run:

```bash
# 1. Rename branch to main
"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" branch -M main

# 2. Add your GitHub repository URL (replace with your repo URL):
"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" remote add origin https://github.com/YOUR_GITHUB_USERNAME/resqgrid.git

# 3. Push to GitHub:
"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" push -u origin main
```

---

### Step 2: Deploy on Render.com

1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in (Free).
2. Click **New +** in the top right, and choose **Web Service** (or **Blueprint**).

#### Option A: One-Click via Blueprint (Recommended)
1. Select **Blueprint**.
2. Connect your `resqgrid` repository.
3. Render will automatically read [`render.yaml`](./render.yaml) and configure everything:
   - **Name:** `resqgrid`
   - **Runtime:** `Node`
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm run start`
   - **Healthcheck Path:** `/api/health`
4. Click **Apply**.

#### Option B: Manual Web Service
1. Select **Web Service**.
2. Connect your `resqgrid` repository.
3. Set the following fields:
   - **Name:** `resqgrid` (or any name you prefer)
   - **Language / Runtime:** `Node`
   - **Region:** Any (e.g. `Oregon (US West)`)
   - **Branch:** `main` (or `master`)
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
5. Click **Create Web Service**.

---

### Step 3: Access your Live Public URL

Once the build finishes (takes ~1-2 minutes), Render will display your public URL:
**`https://resqgrid.onrender.com`** (or your custom service name).

* Both the React Frontend and the Express API are hosted under this single HTTPS URL.
* All citizen, department, command-center, and admin logins work out of the box with zero external database configuration required.
