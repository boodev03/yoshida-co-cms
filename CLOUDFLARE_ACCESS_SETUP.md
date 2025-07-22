# Cloudflare Access Setup Guide

## Overview
Your project now uses:
- **Cloudflare D1** for database (via REST API)
- **Cloudflare Access** for authentication  
- **Cloudflare R2** for file storage

## 🚀 Quick Start

### 1. Database is Ready
Your D1 database is already initialized with:
- Database ID: `4f5dd730-05ef-4f74-addd-b4e1a34e7cf5`
- Database Name: `yoshida-cor`
- Tables: `categories`, `products`, `news`, `equipments`

### 2. Set Up Cloudflare Access

#### A. Create a Cloudflare Zero Trust Team
1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Create a new team (if you don't have one)
3. Note your team domain: `your-team-name.cloudflareaccess.com`

#### B. Configure Access Application
1. In Zero Trust dashboard → Access → Applications
2. Click "Add an application" → "Self-hosted"
3. Configure:
   - **Application name**: Yoshida CMS
   - **Session duration**: 24 hours
   - **Application domain**: Your domain (e.g., `cms.yoshida.co`)
4. Create access policy:
   - **Policy name**: Admin Access
   - **Rule**: Include → Emails → `your-admin-email@domain.com`

### 3. Update Environment Variables

Update `.env.local`:
```env
CLOUDFLARE_TEAM_DOMAIN=your-team-name
NEXT_PUBLIC_CLOUDFLARE_TEAM_DOMAIN=your-team-name
```

### 4. Test the Setup

```bash
# Test database connection
npm run db:query "SELECT * FROM categories LIMIT 1"

# Start development
npm run dev
```

## 🔧 How It Works

### Database
- Uses Cloudflare D1 REST API for all database operations
- No mock data - direct connection to your D1 database
- All CRUD operations work through `/api/database` endpoint

### Authentication  
- Users are redirected to Cloudflare Access for login
- Cloudflare Access validates identity and returns to your app
- User info is extracted from Cloudflare Access JWT tokens

### File Storage
- Already configured with Cloudflare R2
- Files are uploaded directly to your `yoshida-cor` bucket

## 🔐 Creating User Accounts

### Option 1: Email-based Access
In Cloudflare Access → Applications → Your App → Policies:
- Add specific email addresses who can access the CMS

### Option 2: Domain-based Access  
- Add rule: Include → Email domain → `@yourdomain.com`
- Anyone with your domain email can access

### Option 3: External Identity Providers
Configure OAuth with:
- Google Workspace
- Azure AD
- GitHub
- And more...

## 🚀 Deployment

### Option 1: Cloudflare Pages (Recommended)
```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy .next --project-name=yoshida-cms
```

### Option 2: Other Platforms
The project works on any platform that supports:
- Node.js API routes
- Environment variables
- Outbound HTTPS requests to Cloudflare APIs

## 🛠 Commands

```bash
# Database operations
npm run db:init        # Initialize schema
npm run db:query       # Run SQL commands
npm run db:local       # Use local D1 database

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

## 🔍 Troubleshooting

### "Database connection not available"
- Check `CLOUDFLARE_API_TOKEN` has D1 edit permissions
- Verify `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_DATABASE_ID`

### "No Cloudflare Access token found"
- Check if Cloudflare Access is properly configured
- Verify your domain is protected by Cloudflare Access
- Make sure `CLOUDFLARE_TEAM_DOMAIN` is correct

### Authentication not working
1. Visit: `https://your-team-name.cloudflareaccess.com/cdn-cgi/access/login`
2. Check if you can access your protected domain
3. Verify email is in the access policy

## 🔒 Security Notes

1. **API Token**: Keep your Cloudflare API token secure
2. **Access Policies**: Only allow necessary users in Access policies  
3. **Domain Protection**: Ensure your production domain is protected by Access
4. **Regular Audits**: Review Access logs regularly

## 📞 Need Help?

- Check Cloudflare Access logs in the dashboard
- Verify D1 database queries in Cloudflare dashboard
- Test API endpoints manually using tools like Postman