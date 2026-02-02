#!/bin/bash

# Production Environment Setup Script
echo "🔧 CodeForge Production Environment Setup"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}This script will help you set up environment variables for production deployment.${NC}"
echo ""

# Get Railway URL
echo -e "${YELLOW}Step 1: Railway Backend Setup${NC}"
read -p "Enter your Railway app URL (e.g., https://your-app.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "Railway URL is required. Exiting."
    exit 1
fi

# Get Vercel URL
echo ""
echo -e "${YELLOW}Step 2: Vercel Frontend Setup${NC}"
read -p "Enter your Vercel app URL (e.g., https://your-app.vercel.app): " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo "Vercel URL is required. Exiting."
    exit 1
fi

echo ""
echo -e "${GREEN}🎯 Environment Variables for Railway (Backend):${NC}"
echo "Copy these to Railway Dashboard → Settings → Environment Variables:"
echo ""
echo "NODE_ENV=production"
echo "PORT=3001"
echo "DEV_MODE=false"
echo "CORS_ORIGIN=$VERCEL_URL"
echo "FIREBASE_PROJECT_ID=codeforge-5e078"
echo "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codeforge-5e078.iam.gserviceaccount.com"
echo "FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----"
echo "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCIkzB073c9AZRt"
echo "gqMZ3887pAhNDLa/jyqxEuUHCc4jOij5HC9s/KItR7tP6WHi88/ZpfvLQFtrvfeH"
echo "Css6vBGCFPS5PcpHiC/eni7hb7l014JSq0Aki+hbKE3RgsjwNDDDuWp67CSYxyXZ"
echo "64FeLNPy5WBdK0oVssrvgdfQKeU17sU6ZeOQx9Db4zyEmXJL4LtgapilnSMNXh6y"
echo "KLEsYSyzpYSiO5vZrFSMMA9Nl+FlzO8kTsebbMhywCn3nZwEx3DRhn/q6uS7GOf+"
echo "oDFP2D/oHAhcJMnFUivxIyh0gF1/73Kh8Sa7Q3Ae86v0DrGdpeSMI3oxiwBMMDTV"
echo "SSqR4SnXAgMBAAECggEANJddVwIpi9vyYJMoJFwLTH+XVLg7HRvPyD0q5WFwuB76"
echo "zSZ92r2T49TV++k2cPMLDFg+1B81tREDYsSUysrGAS35qOVy4cW/DT4jdlsT8rrU"
echo "K+pW+lvHv2aPRMjUgK7QQmZBaxFI7G3vlPF7sRyZB1UtnOMBFcbyH3WD+dxQL8pw"
echo "tExMvTMOoG1KtDfz4StZOWIwjM6mG4Q7aEP3FrZs+dg2MyGONgamywFeEHlghYq2"
echo "O52s8NF0Rs6U7X4GM+dAMVsFWqYaODSU6V7eEJRkpXFZVYF3+VlBu2ZAw/PYjG8r"
echo "46/hJcfngZh81HUPL+C8lU6U/P2Tg+rcGo+Eqi+HQQKBgQC8dcmnQL/9ckrvWSqf"
echo "7fp1ljfiogqze9FQ0psY9OX6P/VKAfc+gys4P7NZ6sFiKKbQImIOTDHAViq4tMMF"
echo "++YUmY2ZpvDfWQE+slwCBOx+PQyaNI7YBJIsZRlOEnAOkn3IMEq9FdbXCuJOY7QR"
echo "aRdEsKsKsygxQOnOlmvO38OHlwKBgQC5hTcQTDK8o6e4E9tH4lz0MFgnPy5yaD7A"
echo "bWdOsi2k3R+lRZtxT4lqT1YDbkvRZCPllCwWiIPZhcN+dTGyLhgcmBrqVi45PILC"
echo "yQkBTNVgYN81MoSWjghUWDKRzjKxBxSxQdF0nDpltDOgsptBz4NdbbsHM72MECKg"
echo "UN/KXC23wQKBgHrd9C11unXbWN147aA8/+g/monICWAA3nNqCzIXIASqRBoO9Amu"
echo "bLQMW7rIoXGEfVT+xZz6sgjqZIntV6SEGPnfLoE5ZJrIpVYh5Hhwi1q2JIw4rdRK"
echo "Dp6g/wF2ZdYqTZUBXwitv1aNwwNGX3RmZoQjBjBAo3iREJ3eVcUW/5xbAoGAMIW0"
echo "KjITzxzqwA2Je9qrvz5pwBIZXtj/GKtEquOVZppjLYHwLwnDgiev8oPFlsWfUeuY"
echo "QGiCO8FtqUSTs+u0aL4rxAC4ZEX8WV/lWA61fFi56JsG7K3HZfAPge0xevXEJrx1"
echo "QQ+fgnxISI6OZv8Ud7o8gZy5xclulQmyDqZfWsECgYBy1mb46kHnmIkNJW5xGxua"
echo "crt4ySWlNFcXZR3zUs7K3Ha4kGkltzoHVm3IirTii44IW2xksMhlTM5spzsu1sAp"
echo "ctWG1D823DuovFNPuU97pIPOKMjw8JeRRi8tBk00jtCSAhzEfaiEKWxK+Vm8iVt3"
echo "Wl1uXfnHy9RVEJxtO/0Mqg=="
echo "-----END PRIVATE KEY-----\""
echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-256-bits-long"
echo "JWT_EXPIRES_IN=24h"
echo "JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-256-bits-long"
echo "JWT_REFRESH_EXPIRES_IN=7d"
echo "BCRYPT_ROUNDS=12"
echo "RATE_LIMIT_WINDOW_MS=900000"
echo "RATE_LIMIT_MAX_REQUESTS=100"

echo ""
echo -e "${GREEN}🎯 Environment Variables for Vercel (Frontend):${NC}"
echo "Copy these to Vercel Dashboard → Settings → Environment Variables:"
echo ""
echo "VITE_API_BASE_URL=$RAILWAY_URL/api"
echo "VITE_FIREBASE_API_KEY=AIzaSyAndwvK5KutvLnqKpM0hyrVn5qxOto6mhc"
echo "VITE_FIREBASE_AUTH_DOMAIN=codeforge-5e078.firebaseapp.com"
echo "VITE_FIREBASE_PROJECT_ID=codeforge-5e078"
echo "VITE_FIREBASE_STORAGE_BUCKET=codeforge-5e078.firebasestorage.app"
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=492814148350"
echo "VITE_FIREBASE_APP_ID=1:492814148350:web:a8f8a0c4bda091f513bbaf"

echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Copy the Railway environment variables to Railway Dashboard"
echo "2. Copy the Vercel environment variables to Vercel Dashboard"
echo "3. Add PostgreSQL database in Railway (it will auto-provide DATABASE_URL)"
echo "4. Deploy both applications"
echo "5. Update Firebase authorized domains with your Vercel URL"
echo ""
echo -e "${GREEN}✨ Your CodeForge platform will be live!${NC}"