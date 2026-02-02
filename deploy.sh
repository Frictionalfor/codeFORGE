#!/bin/bash

# CodeForge Deployment Script
echo "🚀 CodeForge Deployment Helper"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - CodeForge application"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

# Build backend to check for errors
echo "🔨 Building backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed. Please fix errors before deploying."
    exit 1
fi
cd ..
echo "✅ Backend build successful"

# Build frontend to check for errors
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed. Please fix errors before deploying."
    exit 1
fi
cd ..
echo "✅ Frontend build successful"

# Commit latest changes
echo "📝 Committing latest changes..."
git add .
git commit -m "Prepare for production deployment - $(date)"
echo "✅ Changes committed"

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy backend to Railway (see DEPLOYMENT_GUIDE.md)"
echo "3. Deploy frontend to Vercel (see DEPLOYMENT_GUIDE.md)"
echo "4. Update environment variables in both platforms"
echo "5. Test your live application!"
echo ""
echo "📖 Full instructions: DEPLOYMENT_GUIDE.md"