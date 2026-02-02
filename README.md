# 🚀 CodeForge - Professional Coding Classroom Platform

<div align="center">

![CodeForge Logo](https://img.shields.io/badge/CodeForge-v2.0.0-blue?style=for-the-badge&logo=code&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange?style=for-the-badge&logo=firebase)
![Real-time](https://img.shields.io/badge/Real--time-Dashboard-green?style=for-the-badge)
![Production Ready](https://img.shields.io/badge/Production-Ready-purple?style=for-the-badge)

**🎓 The Ultimate Coding Education Platform with Firebase Authentication**

*Empowering educators and students with professional-grade programming tools and real-time collaboration*

[🌟 Features](#-features) • [🚀 Quick Start](#-quick-start) • [🔥 What's New](#-whats-new-in-v20) • [📚 Documentation](#-documentation)

</div>

---

## ✨ What is CodeForge?

CodeForge is a **comprehensive educational platform** that revolutionizes programming education by combining the power of modern development environments with classroom management tools. Built with **Firebase Authentication**, **real-time dashboards**, and **professional-grade security**, it's a production-ready solution for coding education.

**Think:** *LeetCode meets Google Classroom with Firebase-powered real-time collaboration*

## 🔥 What's New in v2.0

### 🚀 **Firebase Integration**
- 🔐 **Google Sign-in** - One-click authentication with Google accounts
- 🔥 **Firebase Auth** - Enterprise-grade authentication system
- ⚡ **Real-time Sync** - Instant updates across all devices
- 🛡️ **Enhanced Security** - Firebase Admin SDK with custom claims

### 📊 **Real-time Dashboard**
- 📈 **Live Statistics** - Assignment completion updates in real-time
- 🎯 **Smart Categorization** - Automatic assignment status tracking
- 🔄 **Auto-refresh** - Dashboard updates when submissions complete
- 📱 **Responsive Design** - Beautiful UI across all devices

### 🎨 **Enhanced UI/UX**
- 🌟 **Premium Design** - Clean, modern interface with glassmorphism effects
- 🖼️ **Logo Integration** - Professional branding with custom dashboard logos
- 🎭 **Role-based Interface** - Tailored experiences for teachers and students
- 🌙 **Dark Theme** - Eye-friendly dark mode throughout

### 🔒 **Advanced Security**
- 🛡️ **Firebase Admin SDK** - Server-side authentication validation
- 🔐 **JWT Tokens** - Secure API communication
- 👤 **Immutable Roles** - One account, one role for life
- 🚫 **Anti-duplicate** - Prevents multiple accounts with same email

## 🎯 Perfect For

<table>
<tr>
<td width="50%">

### 👨‍🏫 **Educators**
- 🏫 **University Professors** - CS courses & programming fundamentals
- 🎓 **Bootcamp Instructors** - Intensive coding programs
- 🏫 **High School Teachers** - Introduction to programming
- 🏢 **Corporate Trainers** - Technical skill development
- 🌐 **Online Educators** - Remote programming instruction

</td>
<td width="50%">

### 👨‍🎓 **Students**
- 📚 **CS Students** - Learning programming languages
- 💻 **Bootcamp Participants** - Building practical skills
- 🎯 **Self-learners** - Structured programming practice
- 🚀 **Professionals** - Skill enhancement & training
- 🌍 **Remote Learners** - Distance learning support

</td>
</tr>
</table>

## 🌟 Features

### 💻 **Advanced Code Editor**
- 🔥 **Monaco Editor** - VS Code experience in browser
- 🌐 **Multi-language Support** - C, C++, Python, JavaScript
- 🎨 **Syntax Highlighting** - Beautiful, readable code
- ⚡ **Real-time Execution** - Instant code compilation & testing
- 📊 **Live Results** - Test case execution with immediate feedback

### 🎓 **Classroom Management**
- 📝 **Assignment Creation** - Custom coding challenges with test cases
- 👥 **Class Organization** - Manage students and course structure
- 📊 **Real-time Progress** - Live assignment completion tracking
- 🔍 **Submission Review** - Detailed code analysis & feedback
- 📈 **Performance Analytics** - Comprehensive learning insights

### 🔥 **Firebase-Powered Features**
- 🚀 **Google Sign-in** - Seamless authentication experience
- ⚡ **Real-time Updates** - Live dashboard synchronization
- 🔐 **Secure Authentication** - Firebase Admin SDK integration
- 📱 **Cross-device Sync** - Access from anywhere, anytime
- 🛡️ **Enterprise Security** - Google-grade security infrastructure

### 📊 **Smart Dashboard**
- 📈 **Live Statistics** - Real-time assignment completion tracking
- 🎯 **Smart Categories** - Automatic pending/completed/overdue sorting
- 🔄 **Auto-refresh** - Updates when submissions are processed
- 📱 **Responsive Design** - Perfect on desktop, tablet, and mobile
- 🎨 **Premium UI** - Modern glassmorphism design

## 🏗️ Technical Architecture

### 🛠️ **Tech Stack**

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + Custom Animations
- 🔧 Vite + Monaco Editor
- 🌐 React Router + Axios
- 🔥 Firebase SDK v9

**Backend:**
- 🟢 Node.js + Express.js
- 📝 TypeScript + Sequelize ORM
- 🔥 Firebase Admin SDK
- 🔒 JWT + Custom Authentication
- 🧪 Comprehensive Testing Suite

**Database:**
- 🗄️ SQLite (Development)
- 🐘 PostgreSQL (Production)
- 📊 Optimized queries & indexing
- 🔄 Real-time data synchronization

**Infrastructure:**
- 🚀 Railway (Backend Hosting)
- ⚡ Vercel (Frontend Hosting)
- 🔥 Firebase (Authentication & Services)
- 🌐 CDN-optimized delivery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Firebase Project (for authentication)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codeforge.git
cd codeforge

# Install dependencies for both frontend and backend
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# Setup environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Configure Firebase (see FIREBASE_SETUP_GUIDE.md)
# Add your Firebase config to frontend/.env
# Add Firebase Admin SDK key to backend/

# Start development servers
npm run dev
```

### 🌐 Access the Platform

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 🔑 Authentication

**Firebase Google Sign-in:**
- Use any Google account to sign in
- First-time users select role (Teacher/Student)
- Role selection is permanent and immutable

**Development Mode:**
- Set `VITE_DEV_MODE=true` in frontend/.env for local testing
- Bypasses Firebase authentication for development

## 📚 Documentation

- 🔥 [Firebase Setup Guide](./FIREBASE_SETUP_GUIDE.md) - Complete Firebase configuration
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions
- 📖 [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Complete implementation guide
- 🗄️ [Database Schema](./DATABASE_SCHEMA.md) - Database structure & relationships  
- 🔒 [Security Policy](./SECURITY.md) - Security guidelines & reporting

## 🎨 Key Features Showcase

### 🔥 **Firebase Authentication**
- **Google Sign-in**: One-click authentication with Google accounts
- **Role Selection**: Permanent teacher/student role assignment
- **Security**: Firebase Admin SDK with server-side validation
- **Real-time**: Instant authentication state synchronization

### 📊 **Real-time Dashboard**
- **Live Updates**: Assignment completion reflects immediately
- **Smart Categorization**: Automatic pending/completed/overdue sorting
- **Auto-refresh**: Dashboard updates when code execution completes
- **Responsive**: Beautiful on all screen sizes

### 💻 **Professional Code Editor**
- **Monaco Editor**: Full VS Code experience in browser
- **Multi-language**: C, C++, Python, JavaScript support
- **Real-time Execution**: Instant compilation and test case running
- **Live Results**: Immediate feedback on code submissions

### 🎓 **Advanced Classroom Management**
- **Assignment Creation**: Rich text problems with multiple test cases
- **Class Organization**: Invite codes and enrollment management
- **Progress Tracking**: Real-time student progress monitoring
- **Submission Review**: Detailed code analysis and grading

## 🌟 Why Choose CodeForge v2.0?

### ✅ **Production Ready**
- Firebase-powered authentication system
- Real-time data synchronization
- Enterprise-grade security
- Scalable cloud infrastructure

### 🎯 **Education Focused**
- Purpose-built for programming education
- Intuitive interface for teachers & students
- Real-time feedback & assessment tools
- Comprehensive progress tracking

### 🚀 **Modern Technology**
- Latest React & Node.js technologies
- Firebase integration for real-time features
- Responsive design for all devices
- Fast, reliable, and engaging experience

### 🔒 **Secure & Compliant**
- Firebase Admin SDK security
- Sandboxed code execution environment
- Anti-cheating measures built-in
- FERPA-compliant data protection

## 🚀 Deployment

### Production Deployment

**Frontend (Vercel):**
```bash
cd frontend
npm run build
# Deploy to Vercel
```

**Backend (Railway):**
```bash
cd backend
npm run build
# Deploy to Railway
```

**Environment Setup:**
- Configure Firebase project
- Set production environment variables
- Update CORS origins
- Configure database connections

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and code of conduct.

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 🌐 Connect With Us

<div align="center">

[![Email](https://img.shields.io/badge/Email-swanand2008.08@gmail.com-red?style=for-the-badge&logo=gmail)](mailto:swanand2008.08@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-Frictional-black?style=for-the-badge&logo=github)](https://github.com/Frictionalfor)
[![Instagram](https://img.shields.io/badge/Instagram-@codeforces_with_swanand-purple?style=for-the-badge&logo=instagram)](https://www.instagram.com/codeforces_with_swanand)
[![Twitter](https://img.shields.io/badge/Twitter-@Swanand92092-blue?style=for-the-badge&logo=twitter)](https://x.com/Swanand92092)

</div>

## 📄 License

This project is licensed under the CodeForge Educational Platform License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the programming education community
- Powered by Firebase for real-time collaboration
- Inspired by the need for better coding education tools
- Thanks to all contributors and educators who provided feedback

---

<div align="center">

**🚀 Ready to transform your coding education with Firebase-powered real-time features?**

[Get Started](#-quick-start) • [Firebase Setup](./FIREBASE_SETUP_GUIDE.md) • [Deploy Now](./DEPLOYMENT_GUIDE.md)

*CodeForge v2.0 - Empowering the next generation of programmers with real-time collaboration*

**🌟 Star this repository if you find CodeForge helpful! 🌟**

</div>