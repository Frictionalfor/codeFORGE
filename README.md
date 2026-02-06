# CodeForge - Professional Coding Classroom Platform

<div align="center">

![CodeForge](https://img.shields.io/badge/CodeForge-v2.0-blue?style=for-the-badge&logo=code&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange?style=for-the-badge&logo=firebase)
![Production](https://img.shields.io/badge/Production-Live-green?style=for-the-badge)

**The Ultimate Platform for Coding Education**

*Empowering educators and students with professional-grade programming tools*

[Live Demo](https://code-forge-frontend-tutc.vercel.app) • [Documentation](#documentation) • [Quick Start](#quick-start)

</div>

---

## What is CodeForge?

CodeForge is a comprehensive educational platform that revolutionizes programming education by combining modern development environments with classroom management tools. Built with Firebase Authentication, real-time dashboards, and professional-grade security.

**Perfect for:** Universities • Bootcamps • Online Courses • Corporate Training

---

## Key Features

### Advanced Code Editor
- **Monaco Editor** - Full VS Code experience in browser
- **Multi-language Support** - C, C++, Python, JavaScript
- **Real-time Execution** - Instant code compilation & testing
- **Live Results** - Immediate test case feedback

### Classroom Management
- **Assignment Creation** - Custom coding challenges with test cases
- **Class Organization** - Manage students and courses
- **Real-time Progress** - Live assignment completion tracking
- **Submission Review** - Detailed code analysis & grading
- **Performance Analytics** - Comprehensive learning insights

### Firebase-Powered
- **Google Sign-in** - One-click authentication
- **Real-time Updates** - Live dashboard synchronization
- **Secure Authentication** - Firebase Admin SDK
- **Cross-device Sync** - Access from anywhere
- **Enterprise Security** - Google-grade infrastructure

### Mobile Responsive
- **Mobile-First Design** - Works perfectly on phones and tablets
- **Hamburger Menu** - Clean mobile navigation
- **Touch-Friendly** - Optimized for touch interactions
- **Adaptive Layouts** - Beautiful on all screen sizes

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Vite + Monaco Editor
- Firebase SDK v9

**Backend:**
- Node.js + Express.js
- TypeScript + Sequelize ORM
- Firebase Admin SDK
- JWT Authentication

**Database:**
- SQLite (Development)
- PostgreSQL (Production)

**Hosting:**
- Railway (Backend)
- Vercel (Frontend)
- Firebase (Authentication)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase Project
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/Frictionalfor/codeFORGE.git
cd codeFORGE

# Install dependencies
npm install

# Start development servers (both frontend & backend)
npm run dev
```

### Access Locally
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## Production Deployment

### Live URLs
- **Frontend**: https://code-forge-frontend-tutc.vercel.app
- **Backend**: https://codeforge-backend-production-f678.up.railway.app

### Deploy Your Own

**1. Backend (Railway)**
```bash
# Push to GitHub
git push origin main

# Deploy to Railway
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Copy variables from RAILWAY_ENV_VARIABLES.txt
5. Deploy
```

**2. Frontend (Vercel)**
```bash
# Deploy to Vercel
1. Go to vercel.com
2. New Project → Import from GitHub
3. Root Directory: frontend
4. Framework: Vite
5. Copy variables from VERCEL_ENV_VARIABLES.txt
6. Deploy
```

**3. Connect Services**
- Update `CORS_ORIGIN` in Railway with Vercel URL
- Add domains to Firebase authorized domains

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Firebase Setup](./FIREBASE_SETUP_GUIDE.md) | Complete Firebase configuration |
| [Deployment Guide](./DEPLOYMENT_GUIDE.md) | Production deployment steps |
| [Technical Docs](./TECHNICAL_DOCUMENTATION.md) | Implementation details |
| [Database Schema](./DATABASE_SCHEMA.md) | Database structure |
| [Security Policy](./SECURITY.md) | Security guidelines |

### Quick Reference Files
- `RAILWAY_ENV_VARIABLES.txt` - Backend environment variables
- `VERCEL_ENV_VARIABLES.txt` - Frontend environment variables
- `HOW_TO_DEPLOY.md` - Step-by-step deployment guide

---

## Use Cases

### For Educators
- Create programming assignments with automated testing
- Track student progress in real-time
- Review and grade code submissions
- Manage multiple classes and courses
- Generate performance analytics

### For Students
- Access assignments from any device
- Write and test code in browser
- Get instant feedback on submissions
- Track your learning progress
- Practice with real-world problems

---

## Authentication

**Firebase Google Sign-in:**
- Use any Google account to sign in
- First-time users select role (Teacher/Student)
- Role selection is permanent
- Secure server-side validation

**Development Mode:**
- Set `DEV_MODE=true` for local testing
- Bypasses Firebase for development

---

## Features Showcase

### Real-time Dashboard
- Live assignment completion tracking
- Smart categorization (pending/completed/overdue)
- Auto-refresh on submission completion
- Beautiful glassmorphism design

### Professional Code Editor
- Full VS Code experience
- Syntax highlighting
- Multi-language support
- Real-time execution
- Instant test results

### Classroom Management
- Easy class creation
- Invite code system
- Student enrollment tracking
- Assignment scheduling
- Submission review tools

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

```bash
# Development workflow
npm install          # Install dependencies
npm run dev         # Start dev servers
npm test            # Run tests
npm run lint        # Check code quality
npm run build       # Build for production
```

---

## Connect

<div align="center">

[![Email](https://img.shields.io/badge/Email-swanand2008.08@gmail.com-red?style=for-the-badge&logo=gmail)](mailto:swanand2008.08@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-Frictionalfor-black?style=for-the-badge&logo=github)](https://github.com/Frictionalfor)
[![Instagram](https://img.shields.io/badge/Instagram-@codeforces__with__swanand-purple?style=for-the-badge&logo=instagram)](https://www.instagram.com/codeforces_with_swanand)
[![Twitter](https://img.shields.io/badge/Twitter-@Swanand92092-blue?style=for-the-badge&logo=twitter)](https://x.com/Swanand92092)

</div>

---

## License

This project is licensed under the CodeForge Educational Platform License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with love for the programming education community
- Powered by Firebase for real-time collaboration
- Inspired by the need for better coding education tools
- Thanks to all contributors and educators

---

<div align="center">

**Ready to transform your coding education?**

[Get Started](#quick-start) • [View Live Demo](https://code-forge-frontend-tutc.vercel.app) • [Deploy Now](#production-deployment)

*CodeForge - Empowering the next generation of programmers*

**Star this repository if you find it helpful!**

Made with passion by [Swanand](https://github.com/Frictionalfor)

</div>
