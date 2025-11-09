# DECK CORE - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (connected to GitHub)
- Database setup (MySQL/PlanetScale recommended)

### 2. Deploy Steps

#### Step 1: Push to GitHub
```bash
# If not already initialized
git init
git add .
git commit -m "Initial DECK CORE setup"
git branch -M main
git remote add origin https://github.com/igorgomides/mtg-card-shop.git
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository `igorgomides/mtg-card-shop`
4. Configure the following settings:

**Build & Output Settings:**
- Build Command: `pnpm build`
- Output Directory: `client/dist`
- Install Command: `pnpm install`

#### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```bash
# Database
DATABASE_URL=your_mysql_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
OAUTH_SERVER_URL=https://your-oauth-server.com
OWNER_OPEN_ID=your_owner_open_id

# App Configuration
VITE_APP_ID=deck-core
VITE_APP_TITLE=DECK CORE
VITE_APP_LOGO=https://your-domain.vercel.app/logo.png

# External APIs (Optional)
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://your-analytics.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# OAuth Portal (Optional)
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com
```

### 3. Recommended Database Setup

#### Option A: PlanetScale (Recommended)
1. Create account at [PlanetScale](https://planetscale.com)
2. Create a new database named `deck-core`
3. Get connection string from dashboard
4. Add to `DATABASE_URL` environment variable

#### Option B: Railway MySQL
1. Create account at [Railway](https://railway.app)
2. Deploy MySQL template
3. Get connection string
4. Add to `DATABASE_URL` environment variable

### 4. Post-Deployment Steps

1. **Database Migration:**
   ```bash
   # Run this locally with production DATABASE_URL
   pnpm db:push
   ```

2. **Test the deployment:**
   - Visit your Vercel URL
   - Check that DECK CORE branding appears
   - Test card search functionality
   - Verify admin login works

### 5. Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain (e.g., `deckcore.com`)
4. Follow DNS configuration instructions

### 6. Monitoring & Performance

**Built-in Vercel Features:**
- Analytics dashboard
- Performance monitoring
- Error tracking
- Build logs

**Recommended External Tools:**
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for user sessions
- [Umami](https://umami.is) for privacy-focused analytics

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check Node.js version (use Node 18+)
   - Ensure all dependencies are installed
   - Verify environment variables are set

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check database permissions
   - Ensure database exists

3. **API Errors:**
   - Check external API keys
   - Verify CORS settings
   - Check rate limits

### Getting Help:
- Check Vercel deployment logs
- Review browser console for errors
- Contact support if needed

## 🎯 Performance Optimization

1. **Enable Vercel Analytics:**
   ```bash
   # Add to your project
   npm i @vercel/analytics
   ```

2. **Image Optimization:**
   - Use Vercel Image component
   - Optimize card images
   - Enable WebP format

3. **Caching Strategy:**
   - API responses (5-15 minutes)
   - Static assets (1 year)
   - Card data (1 hour)

---

**Deployment completed! 🎉**

Your DECK CORE trading card marketplace is now live on Vercel!