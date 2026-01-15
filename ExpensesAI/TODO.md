# Deployment to Netlify with Firebase Integration - TODO List

## Step 1: Test Build Locally
- [x] Run `npm run build` to ensure the app builds successfully
- [x] Check for any build errors or warnings

## Step 2: Prepare for Production
- [ ] Verify Firebase environment variables are set in .env.local
- [ ] Ensure all VITE_FIREBASE_* variables are present

## Step 3: Push to GitHub
- [x] Add untracked files (.github/ directory)
- [x] Commit all changes
- [x] Create GitHub repository (if not exists)
- [x] Push to GitHub repository

## Step 4: Netlify Setup
- [ ] Connect Netlify to GitHub repository
- [ ] Configure build settings (build command: `npm run build`, publish directory: `dist`)

## Step 5: Configure Environment Variables
- [ ] Set Firebase environment variables in Netlify dashboard
- [ ] Ensure all VITE_FIREBASE_* variables are configured

## Step 6: Deploy
- [ ] Trigger deployment on Netlify
- [ ] Monitor build logs for success

## Step 7: Test Firebase Integration
- [ ] Test authentication (email/password and Google sign-in) on live site
- [ ] Test database operations (if any)
- [ ] Verify session persistence and routing
