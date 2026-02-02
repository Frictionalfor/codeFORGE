#!/bin/bash

# CodeForge Deployment Checklist
echo "🚀 CodeForge Deployment Checklist"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo ""
echo "📋 Pre-deployment checks..."

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm version
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check git
if command_exists git; then
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${RED}❌ Git not found${NC}"
    exit 1
fi

echo ""
echo "🔨 Building projects..."

# Build backend
echo "Building backend..."
cd backend
npm install
npm run build
BACKEND_BUILD=$?
cd ..
print_status $BACKEND_BUILD "Backend build"

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
FRONTEND_BUILD=$?
cd ..
print_status $FRONTEND_BUILD "Frontend build"

echo ""
echo "🔍 Checking environment files..."

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env not found (will use Railway env vars)${NC}"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env not found (will use Vercel env vars)${NC}"
fi

echo ""
echo "📦 Checking deployment files..."

# Check Railway config
if [ -f "railway.json" ]; then
    echo -e "${GREEN}✅ railway.json exists${NC}"
else
    echo -e "${RED}❌ railway.json missing${NC}"
fi

# Check Vercel config
if [ -f "frontend/vercel.json" ]; then
    echo -e "${GREEN}✅ frontend/vercel.json exists${NC}"
else
    echo -e "${RED}❌ frontend/vercel.json missing${NC}"
fi

echo ""
echo "🔐 Security checks..."

# Check for sensitive files in git
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}❌ .env files are tracked in git (security risk)${NC}"
else
    echo -e "${GREEN}✅ .env files not tracked in git${NC}"
fi

# Check for Firebase key file
if [ -f "codeforge-5e078-firebase-adminsdk-fbsvc-f00ca443ff.json" ]; then
    if git ls-files | grep -q "firebase.*\.json"; then
        echo -e "${RED}❌ Firebase key file is tracked in git (security risk)${NC}"
    else
        echo -e "${GREEN}✅ Firebase key file not tracked in git${NC}"
    fi
fi

echo ""
if [ $BACKEND_BUILD -eq 0 ] && [ $FRONTEND_BUILD -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy backend to Railway"
    echo "3. Deploy frontend to Vercel"
    echo "4. Update environment variables"
    echo "5. Test your live application"
    echo ""
    echo "📖 Full guide: DEPLOYMENT_GUIDE.md"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi