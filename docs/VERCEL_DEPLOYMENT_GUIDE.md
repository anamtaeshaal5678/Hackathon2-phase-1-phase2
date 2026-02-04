# Vercel Deployment Guide - Fix Sign-In Issues

## Problem
Sign-in fails on Vercel because SQLite cannot be shared between the Frontend (Next.js) and Backend (Python) serverless functions. They run in isolated environments.

## Solution: Use PostgreSQL

### Step 1: Create a PostgreSQL Database

Choose one of these free options:

#### Option A: Neon (Recommended - Fastest Setup)
1. Go to https://neon.tech
2. Sign up/Login
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

#### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

#### Option C: Vercel Postgres
1. In your Vercel dashboard
2. Go to Storage → Create Database → Postgres
3. Copy the connection string from the `.env.local` tab

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `hackathon2-phase-1-phase2`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | `your-random-secret-key-min-32-chars` | Production, Preview, Development |
| `BETTER_AUTH_URL` | `https://hackathon2-phase-1-phase2.vercel.app` | Production |
| `ALLOWED_ORIGINS` | `https://hackathon2-phase-1-phase2.vercel.app` | Production |

**Generate a secure secret:**
```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the three dots (•••) on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete (~2-3 minutes)

### Step 4: Test

1. Visit: https://hackathon2-phase-1-phase2.vercel.app/signup
2. Create a new account
3. Sign in
4. You should now see the dashboard!

## Troubleshooting

### Still getting errors?

1. **Check Vercel Logs:**
   - Go to Deployments → Click on latest deployment
   - Click "View Function Logs"
   - Look for errors in both `/api/auth/*` and `/api/backend/*`

2. **Verify Environment Variables:**
   - Make sure `DATABASE_URL` starts with `postgresql://` (not `postgres://`)
   - Ensure all variables are set for "Production" environment

3. **Database Connection:**
   - Test your PostgreSQL connection string locally first
   - Make sure the database allows connections from Vercel's IP ranges

### Local Testing with PostgreSQL

To test locally with the same database:

1. Create `.env.local` in `frontend/`:
```env
DATABASE_URL="postgresql://your-connection-string"
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

2. Update `backend/.env`:
```env
DATABASE_URL="postgresql://your-connection-string"
```

3. Restart both servers

## Why This Fixes Sign-In

**Before (SQLite):**
- Frontend writes user to `/tmp/todo.db` (Frontend container)
- Backend reads from `/tmp/todo.db` (Backend container - different file!)
- Result: User not found → 401 Unauthorized

**After (PostgreSQL):**
- Frontend writes user to `postgresql://shared-db`
- Backend reads from `postgresql://shared-db` (same database!)
- Result: User found → Sign-in successful ✅
