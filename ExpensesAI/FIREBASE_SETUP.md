# Firebase Authentication Setup Guide

## Overview
Your ExpenseAI application now uses **Firebase Authentication** instead of localStorage. This provides enterprise-grade security with features like:
- Secure password storage
- Multi-device session management
- Google OAuth integration
- Apple OAuth integration (ready to configure)
- Real-time authentication state management

## Setup Instructions

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "ExpenseAI")
4. Follow the setup wizard (disable Google Analytics is fine for now)
5. Create the project

### Step 2: Enable Authentication Methods
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Sign-in method**
3. Enable these providers:
   - **Email/Password**: Click enable, turn on "Email/Password"
   - **Google**: Click enable, select your default project email, add test emails if needed
   - **Apple** (optional): Click enable when ready for iOS support

### Step 3: Get Your Firebase Config
1. Go to **Project Settings** (gear icon, top right)
2. Click **Your apps** section
3. If no web app exists, click **Add app** → select **Web**
4. You'll see the Firebase config - copy these values:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

### Step 4: Configure .env.local
Open `.env.local` in your project root and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 5: Restart the Dev Server
```bash
npm run dev
```
The app will automatically detect Firebase is configured and use it for authentication.

## Features Enabled

### Email/Password Authentication
- Users can sign up with email and password
- Passwords are securely hashed by Firebase
- No plaintext passwords stored locally

### Google Sign-In
- One-click Google login
- Automatically creates/logs in user account
- No password required

### Apple Sign-In (Ready)
- Configuration in progress
- Just needs provider setup in Firebase Console

### Security Features
- Secure token-based sessions (handled by Firebase)
- No localStorage data exposure
- Automatic logout on app close
- Cross-device session management

## Code Changes Made

### AuthContext.tsx
- Replaced localStorage with Firebase SDK
- Uses `onAuthStateChanged()` for real-time state updates
- Implements proper Firebase error handling
- Integrates Google OAuth via `signInWithPopup()`

### What No Longer Works
- ❌ Local user storage (localStorage)
- ❌ Mock authentication
- ❌ Hard-coded test accounts

## Testing the Setup

### Test Email/Password
1. Sign up with: test@example.com / password123
2. Log out
3. Log in with same credentials
4. Should work seamlessly

### Test Google Sign-In
1. Click "Google" button on login/signup
2. Select your Gmail account
3. Should automatically log in

### Test Persistence
1. Log in to your account
2. Refresh the page
3. Should stay logged in (Firebase manages this)
4. Close and reopen browser
5. Still logged in (Firebase persists session)

## Environment Variables
⚠️ **IMPORTANT**: Keep your `.env.local` file private!
- Never commit `.env.local` to git (it's in .gitignore by default)
- Never share your API keys
- Rotate keys if accidentally exposed

## Troubleshooting

### "Firebase is not initialized"
- Check `.env.local` has all required variables
- Verify credentials are correct from Firebase Console
- Restart dev server after updating `.env.local`

### Google Sign-In Not Working
- Make sure Google provider is enabled in Firebase Console
- Check that your domain is whitelisted (should be auto-added)
- Try in Incognito window to clear cookies

### Still Seeing localStorage Errors
- Clear browser cache/localStorage: DevTools → Application → Clear storage
- Try Incognito/Private window
- Restart dev server

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Add your credentials to `.env.local`
3. ✅ Test authentication flows
4. (Optional) Set up Apple Sign-In
5. (Optional) Add password reset functionality
6. Deploy to production with environment variables

## Security Best Practices

- Use different Firebase projects for development and production
- Enable Firebase Security Rules for Firestore/Database
- Set up Firebase Cloud Backups
- Review Firebase security audit logs regularly
- Use strong passwords or encourage social login

## Support

For Firebase documentation: https://firebase.google.com/docs
For issues: Check Firebase Console → Authentication → Logs
