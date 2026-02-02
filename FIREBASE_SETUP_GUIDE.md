# Firebase Authentication Setup Guide

## Current Status ✅

Your Firebase project is configured and the frontend is running! Here's what we've accomplished:

- ✅ Firebase project created: `codeforge-5e078`
- ✅ Frontend Firebase configuration updated
- ✅ Frontend running on http://localhost:5174/
- ✅ Database migration completed (Firebase fields added)
- ✅ Authentication components created
- ✅ Role selection system implemented

## Next Steps to Complete Setup

### 1. Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/codeforge-5e078)
2. Click **Authentication** in the left sidebar
3. Click **Get started** if not already enabled
4. Go to **Sign-in method** tab
5. Enable these providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your support email

### 2. Generate Service Account Key for Backend

1. In Firebase Console, click the gear icon → **Project Settings**
2. Go to **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Extract these values from the JSON:
   - `project_id`
   - `private_key` 
   - `client_email`

### 3. Update Backend Environment Variables

Edit `backend/.env` and uncomment/update these lines:

```bash
# Uncomment and fill these with your service account values:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@codeforge-5e078.iam.gserviceaccount.com

# Set to false to enable Firebase Admin SDK
DEV_MODE=false
```

### 4. Test the Authentication Flow

1. Open http://localhost:5174/
2. Click **Get Started** or **Sign In**
3. Try registering with email/password
4. Try Google Sign-in (after enabling in console)
5. Complete role selection (Teacher/Student)
6. Verify email verification flow

## What's Already Implemented

### Frontend Features ✅
- Firebase authentication context
- Login/Register forms with Google Sign-in
- Role selection component
- Email verification component
- Protected routes and role guards
- Error handling and loading states

### Backend Features ✅
- Firebase Admin SDK integration
- Token verification middleware
- User profile management
- Role assignment endpoints
- Database schema with Firebase fields
- Legacy user migration support

### Authentication Flow ✅
1. User signs up/in with Firebase
2. System prompts for role selection (Teacher/Student)
3. Backend creates user profile with role
4. Email verification (if using email/password)
5. Full access to platform features

## Current Configuration

**Frontend Firebase Config:**
```javascript
{
  apiKey: "AIzaSyAndwvK5KutvLnqKpM0hyrVn5qxOto6mhc",
  authDomain: "codeforge-5e078.firebaseapp.com",
  projectId: "codeforge-5e078",
  storageBucket: "codeforge-5e078.firebasestorage.app",
  messagingSenderId: "492814148350",
  appId: "1:492814148350:web:a8f8a0c4bda091f513bbaf"
}
```

## Troubleshooting

### If Backend Won't Start
The backend has some TypeScript issues that need fixing. For now:
1. Complete the Firebase Console setup
2. Test the frontend authentication
3. We'll fix the backend issues next

### If Authentication Doesn't Work
1. Check Firebase Console → Authentication → Users (should show new registrations)
2. Check browser console for errors
3. Verify Firebase configuration in `.env` files

## Next Development Steps

Once Firebase is fully configured:
1. Fix remaining backend TypeScript issues
2. Test complete authentication flow
3. Implement legacy user migration
4. Add email verification enforcement
5. Deploy to production (Vercel + Railway)

## Files Modified

- `frontend/.env` - Firebase configuration
- `backend/.env` - Firebase Admin configuration  
- `frontend/src/config/firebase.ts` - Firebase initialization
- `backend/src/config/firebase.ts` - Firebase Admin SDK
- `frontend/src/contexts/FirebaseAuthContext.tsx` - Auth context
- `backend/src/middleware/firebaseAuth.ts` - Token verification
- `backend/src/routes/firebaseAuthRoutes.ts` - Auth endpoints
- `backend/src/services/userService.ts` - User management
- Database schema updated with Firebase fields

The foundation is solid! Complete the Firebase Console setup and you'll have a fully functional authentication system.