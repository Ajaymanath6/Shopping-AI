# Vercel Deployment Guide

This project is configured for deployment to Vercel.

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Deploy**
   - Vercel will automatically:
     - Install dependencies (`npm install`)
     - Build the project (`npm run build`)
     - Deploy to a production URL
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production: `vercel --prod`

## Configuration

The project includes:
- `vercel.json` - Vercel configuration with SPA routing support
- Build output: `dist/` directory
- Framework: Auto-detected as Vite

## Environment Variables

If you need environment variables:
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add your variables
4. Redeploy

## Custom Domain

1. Go to your project in Vercel Dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Notes

- The project is configured for root path deployment (no subpath like `/shopos/`)
- SPA routing is handled automatically via `vercel.json` rewrites
- All routes will redirect to `index.html` for client-side routing
