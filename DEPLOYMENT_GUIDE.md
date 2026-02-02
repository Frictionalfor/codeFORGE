# 🚀 CodeForge Deployment Guide

## Overview
- **Backend**: Railway (Node.js + PostgreSQL)
- **Frontend**: Vercel (React/Vite)
- **Database**: Railway PostgreSQL
- **Authentication**: Firebase

## 📋 Pre-Deployment Checklist

### ✅ **Completed**
- [x] Firebase project configured (`codeforge-5e078`)
- [x] Backend TypeScript compilation fixed
- [x] Frontend authentication flow implemented
- [x] Database schema with Firebase fields
- [x] Production environment files created

### 🔧 **Required Before Deployment**
- [ ] Enable Firebase Authentication providers (Email/Password + Google)
- [ ] Test authentication flow locally
- [ ] Update CORS origins for production
- [ ] Set production environment variables

---

## 🚂 **Backend Deployment (Railway)**

### **Step 1: Deploy to Railway**

1. **Connect Repository**:
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create Railway Project**:
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your CodeForge repository
   - Railway will auto-detect Node.js and use `railway.json`

3. **Add PostgreSQL Database**:
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

### **Step 2: Set Environment Variables**

In Railway dashboard → Settings → Environment Variables, add:

```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://... (auto-generated)

# Firebase Admin SDK
FIREBASE_PROJECT_ID=codeforge-5e078
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCIkzB073c9AZRt
gqMZ3887pAhNDLa/jyqxEuUHCc4jOij5HC9s/KItR7tP6WHi88/ZpfvLQFtrvfeH
Css6vBGCFPS5PcpHiC/eni7hb7l014JSq0Aki+hbKE3RgsjwNDDDuWp67CSYxyXZ
64FeLNPy5WBdK0oVssrvgdfQKeU17sU6ZeOQx9Db4zyEmXJL4LtgapilnSMNXh6y
KLEsYSyzpYSiO5vZrFSMMA9Nl+FlzO8kTsebbMhywCn3nZwEx3DRhn/q6uS7GOf+
oDFP2D/oHAhcJMnFUivxIyh0gF1/73Kh8Sa7Q3Ae86v0DrGdpeSMI3oxiwBMMDTV
SSqR4SnXAgMBAAECggEANJddVwIpi9vyYJMoJFwLTH+XVLg7HRvPyD0q5WFwuB76
zSZ92r2T49TV++k2cPMLDFg+1B81tREDYsSUysrGAS35qOVy4cW/DT4jdlsT8rrU
K+pW+lvHv2aPRMjUgK7QQmZBaxFI7G3vlPF7sRyZB1UtnOMBFcbyH3WD+dxQL8pw
tExMvTMOoG1KtDfz4StZOWIwjM6mG4Q7aEP3FrZs+dg2MyGONgamywFeEHlghYq2
O52s8NF0Rs6U7X4GM+dAMVsFWqYaODSU6V7eEJRkpXFZVYF3+VlBu2ZAw/PYjG8r
46/hJcfngZh81HUPL+C8lU6U/P2Tg+rcGo+Eqi+HQQKBgQC8dcmnQL/9ckrvWSqf
7fp1ljfiogqze9FQ0psY9OX6P/VKAfc+gys4P7NZ6sFiKKbQImIOTDHAViq4tMMF
++YUmY2ZpvDfWQE+slwCBOx+PQyaNI7YBJIsZRlOEnAOkn3IMEq9FdbXCuJOY7QR
aRdEsKsKsygxQOnOlmvO38OHlwKBgQC5hTcQTDK8o6e4E9tH4lz0MFgnPy5yaD7A
bWdOsi2k3R+lRZtxT4lqT1YDbkvRZCPllCwWiIPZhcN+dTGyLhgcmBrqVi45PILC
yQkBTNVgYN81MoSWjghUWDKRzjKxBxSxQdF0nDpltDOgsptBz4NdbbsHM72MECKg
UN/KXC23wQKBgHrd9C11unXbWN147aA8/+g/monICWAA3nNqCzIXIASqRBoO9Amu
bLQMW7rIoXGEfVT+xZz6sgjqZIntV6SEGPnfLoE5ZJrIpVYh5Hhwi1q2JIw4rdRK
Dp6g/wF2ZdYqTZUBXwitv1aNwwNGX3RmZoQjBjBAo3iREJ3eVcUW/5xbAoGAMIW0
KjITzxzqwA2Je9qrvz5pwBIZXtj/GKtEquOVZppjLYHwLwnDgiev8oPFlsWfUeuY
QGiCO8FtqUSTs+u0aL4rxAC4ZEX8WV/lWA61fFi56JsG7K3HZfAPge0xevXEJrx1
QQ+fgnxISI6OZv8Ud7o8gZy5xclulQmyDqZfWsECgYBy1mb46kHnmIkNJW5xGxua
crt4ySWlNFcXZR3zUs7K3Ha4kGkltzoHVm3IirTii44IW2xksMhlTM5spzsu1sAp
ctWG1D823DuovFNPuU97pIPOKMjw8JeRRi8tBk00jtCSAhzEfaiEKWxK+Vm8iVt3
Wl1uXfnHy9RVEJxtO/0Mqg==
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codeforge-5e078.iam.gserviceaccount.com

# Server Configuration
NODE_ENV=production
PORT=3001
DEV_MODE=false

# CORS (Will be updated after Vercel deployment)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# JWT (Legacy)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-256-bits-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-256-bits-long
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 3: Deploy**
- Railway will automatically build and deploy
- Note your Railway URL: `https://your-app-name.railway.app`

---

## ▲ **Frontend Deployment (Vercel)**

### **Step 1: Deploy to Vercel**

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project" → Import from GitHub
   - Select your CodeForge repository
   - Set **Root Directory** to `frontend`

2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Step 2: Set Environment Variables**

In Vercel dashboard → Settings → Environment Variables, add:

```bash
# API Configuration (Use your Railway backend URL)
VITE_API_BASE_URL=https://your-railway-app.railway.app/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAndwvK5KutvLnqKpM0hyrVn5qxOto6mhc
VITE_FIREBASE_AUTH_DOMAIN=codeforge-5e078.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=codeforge-5e078
VITE_FIREBASE_STORAGE_BUCKET=codeforge-5e078.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=492814148350
VITE_FIREBASE_APP_ID=1:492814148350:web:a8f8a0c4bda091f513bbaf
```

### **Step 3: Deploy**
- Vercel will automatically build and deploy
- Note your Vercel URL: `https://your-app-name.vercel.app`

---

## 🔄 **Post-Deployment Configuration**

### **Step 1: Update CORS Origins**

Update Railway environment variable:
```bash
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### **Step 2: Update Firebase Configuration**

1. **Go to Firebase Console** → Authentication → Settings
2. **Add Authorized Domains**:
   - `your-vercel-app.vercel.app`
   - `your-railway-app.railway.app` (if needed)

### **Step 3: Test Production Deployment**

1. **Visit your Vercel URL**
2. **Test Registration Flow**:
   - Click "Get Started"
   - Register with email/password
   - Select role (Teacher/Student)
   - Verify email if required
   - Access dashboard

---

## 🔧 **Environment Variables Summary**

### **Railway (Backend)**
```bash
DATABASE_URL=postgresql://... (auto-generated)
FIREBASE_PROJECT_ID=codeforge-5e078
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codeforge-5e078.iam.gserviceaccount.com
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
DEV_MODE=false
```

### **Vercel (Frontend)**
```bash
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_FIREBASE_API_KEY=AIzaSyAndwvK5KutvLnqKpM0hyrVn5qxOto6mhc
VITE_FIREBASE_AUTH_DOMAIN=codeforge-5e078.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=codeforge-5e078
VITE_FIREBASE_STORAGE_BUCKET=codeforge-5e078.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=492814148350
VITE_FIREBASE_APP_ID=1:492814148350:web:a8f8a0c4bda091f513bbaf
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**: Update `CORS_ORIGIN` in Railway
2. **Database Connection**: Check `DATABASE_URL` in Railway
3. **Firebase Auth**: Verify authorized domains in Firebase Console
4. **Build Failures**: Check build logs in Railway/Vercel dashboards

### **Health Checks**

- **Backend**: `https://your-railway-app.railway.app/health`
- **Frontend**: `https://your-vercel-app.vercel.app`

---

## 🎉 **Success!**

Once deployed, your CodeForge application will be live at:
- **Frontend**: `https://your-vercel-app.vercel.app`
- **Backend API**: `https://your-railway-app.railway.app`

Users can register, select roles, and use the complete platform in production!

---

## 📝 **Next Steps After Deployment**

1. **Custom Domain** (Optional): Add custom domain in Vercel
2. **Monitoring**: Set up error tracking (Sentry, LogRocket)
3. **Analytics**: Add Google Analytics or similar
4. **Performance**: Monitor with Vercel Analytics
5. **Backup**: Set up database backups in Railway

Your CodeForge platform is now production-ready! 🚀