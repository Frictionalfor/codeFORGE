# 🚀 Step-by-Step Deployment Guide

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up or log in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **CodeForge repository**

### Step 2: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click **"+ New"** button
3. Select **"Database"**
4. Choose **"PostgreSQL"**
5. Railway will automatically create `DATABASE_URL` variable

### Step 3: Configure Backend Service
1. Click on your **backend service** (not the database)
2. Go to **"Settings"** tab
3. Under **"Root Directory"**, enter: `backend`
4. Under **"Start Command"**, it should be: `npm start`
5. Under **"Build Command"**, it should be: `npm install && npm run build`

### Step 4: Add Environment Variables
1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Click **"Raw Editor"** button (top right)
4. Open the file: **`RAILWAY_ENV_VARIABLES.txt`**
5. Copy ALL the content from that file
6. Paste it into Railway's Raw Editor
7. Click **"Update Variables"**

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete (check "Deployments" tab)
3. Once deployed, click **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account & Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select your **CodeForge repository**

### Step 2: Configure Build Settings
1. **Framework Preset**: Select **"Vite"**
2. **Root Directory**: Click "Edit" and enter: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Add Environment Variables
1. Before clicking "Deploy", scroll down to **"Environment Variables"**
2. Open the file: **`VERCEL_ENV_VARIABLES.txt`**
3. For each variable in that file:
   - Enter the **Key** (e.g., `VITE_API_BASE_URL`)
   - Enter the **Value** (e.g., `https://your-railway-app.railway.app/api`)
   - Click **"Add"**

**IMPORTANT**: Update `VITE_API_BASE_URL` with your actual Railway URL from Part 1, Step 5

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Once deployed, **copy your Vercel URL** (e.g., `https://your-app.vercel.app`)

---

## Part 3: Connect Backend & Frontend

### Step 1: Update Railway CORS
1. Go back to **Railway**
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Find the variable: `CORS_ORIGIN`
5. Update its value to your **Vercel URL** (from Part 2, Step 4)
6. Example: `https://your-app.vercel.app`
7. Railway will automatically redeploy

### Step 2: Update Firebase Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **codeforge-5e078**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your **Vercel domain** (e.g., `your-app.vercel.app`)
6. Add your **Railway domain** (e.g., `your-app.railway.app`)
7. Click **"Add"**

---

## Part 4: Test Your Deployment

### Step 1: Test Backend
1. Open your Railway URL in browser: `https://your-app.railway.app/health`
2. You should see a health check response
3. Example: `{"status":"ok","timestamp":"..."}`

### Step 2: Test Frontend
1. Open your Vercel URL in browser: `https://your-app.vercel.app`
2. You should see the CodeForge landing page
3. Try to register a new account
4. Try to log in

### Step 3: Test Full Flow
1. Click **"Get Started"**
2. Register with email and password
3. Select role (Teacher or Student)
4. Verify you can access the dashboard

---

## 🎉 Success!

Your CodeForge platform is now live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

---

## 📋 Quick Reference Files

- **`RAILWAY_ENV_VARIABLES.txt`** - Copy/paste for Railway
- **`VERCEL_ENV_VARIABLES.txt`** - Copy/paste for Vercel
- **`DEPLOYMENT_GUIDE.md`** - Detailed technical guide
- **`DEPLOYMENT_SUMMARY.md`** - Quick reference

---

## 🔧 Troubleshooting

### Backend won't start
- Check Railway logs: Click service → "Deployments" → Latest deployment → "View Logs"
- Verify all environment variables are set
- Ensure PostgreSQL database is connected

### Frontend shows API errors
- Verify `VITE_API_BASE_URL` in Vercel matches your Railway URL
- Check CORS_ORIGIN in Railway matches your Vercel URL
- Redeploy Vercel after changing environment variables

### Firebase authentication fails
- Verify authorized domains in Firebase Console
- Check Firebase credentials in both Railway and Vercel
- Ensure Firebase Authentication is enabled

### Database connection errors
- Verify PostgreSQL is added in Railway
- Check that `DATABASE_URL` is automatically set
- Review Railway logs for specific error messages

---

## 🆘 Need Help?

1. Check Railway logs for backend issues
2. Check Vercel logs for frontend issues
3. Check browser console for client-side errors
4. Verify all environment variables are correct
5. Ensure Firebase is properly configured

Your CodeForge platform should now be fully operational! 🚀