# TrustedLand Deployment Guide

## Deploy to Vercel (Recommended)

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository called `trustedland`
3. Don't initialize with README (we already have files)

### Step 2: Push Your Code to GitHub

Run these commands in your terminal:

```bash
cd /Users/cms/Desktop/TLMDD/trustedland
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/YOUR_USERNAME/trustedland.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel

1. Go to https://vercel.com and sign in (use GitHub to sign in)
2. Click "Add New" → "Project"
3. Import your `trustedland` repository
4. Vercel will auto-detect Next.js settings - keep the defaults
5. Click "Deploy"

### Step 4: Set Up PostgreSQL Database

1. In your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" → Select "Postgres"
3. Choose a database name (e.g., `trustedland-db`)
4. Select the free "Hobby" plan
5. Click "Create"

### Step 5: Connect Database to Your Project

1. Vercel will automatically add `DATABASE_URL` to your environment variables
2. Go to "Settings" → "Environment Variables"
3. Add these additional variables:
   - `NEXTAUTH_SECRET`: Generate one at https://generate-secret.vercel.app/32
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., https://trustedland.vercel.app)

### Step 6: Run Database Migration

1. In Vercel dashboard, go to "Settings" → "General"
2. Find "Build & Development Settings"
3. Add to "Install Command": `npm install && npx prisma generate && npx prisma migrate deploy`

Or run migration via Vercel CLI:
```bash
npx vercel env pull .env.local
npx prisma migrate deploy
```

### Step 7: Redeploy

1. Go back to "Deployments" tab
2. Click the three dots on your latest deployment
3. Click "Redeploy"

Your app will be live at: `https://your-project-name.vercel.app`

## Sharing with Your Business Partner

Once deployed, simply share the Vercel URL with your business partner. They can:
- Register for an account
- Test all features
- Provide feedback

## Local Development

To continue developing locally with your SQLite database:

1. Keep your local `.env` with SQLite:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Production uses PostgreSQL automatically via Vercel environment variables
