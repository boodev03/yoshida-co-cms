# Cloudflare Migration Setup Guide

This guide will help you set up Cloudflare D1 database and authentication to replace Firebase.

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler login`

## Step 1: Create D1 Database

```bash
# Create a new D1 database
wrangler d1 create yoshida-cms-db

# Note the database ID from the output and update wrangler.toml
```

## Step 2: Initialize Database Schema

```bash
# Execute the schema file to create tables
npx wrangler d1 execute yoshida-cor --file=./schema.sql
```

## Step 3: Environment Variables

Create a `.env.local` file with the following variables:

```env
# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudflare D1 Database (for API routes)
DATABASE_URL=your-d1-database-url
DATABASE_TOKEN=your-d1-database-token

# Cloudflare R2 Storage (you already have these)
NEXT_PUBLIC_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_ACCESS_KEY_ID=your-access-key
NEXT_PUBLIC_R2_SECRET_ACCESS_KEY=your-secret-key
NEXT_PUBLIC_R2_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-public-url
NEXT_PUBLIC_R2_ACCOUNT_ID=your-account-id
```

## Step 4: Update wrangler.toml

Update the `wrangler.toml` file with your actual database ID and R2 bucket name.

## Step 5: Deploy to Cloudflare Pages

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy ./out --project-name=yoshida-cms
```

## Step 6: Bind D1 Database to Pages

In your Cloudflare dashboard:

1. Go to Pages > your-project > Settings > Functions
2. Add D1 database binding:
   - Variable name: `DB`
   - D1 database: `yoshida-cms-db`

## Step 7: Set Environment Variables in Cloudflare Pages

In your Cloudflare dashboard:

1. Go to Pages > your-project > Settings > Environment variables
2. Add all the environment variables from your `.env.local`

## Step 8: Test the Migration

1. Install dependencies: `npm install`
2. Test locally: `npm run dev`
3. Test authentication with: email: `admin@yoshida.co`, password: `admin123`

## Data Migration (Optional)

If you have existing Firebase data, you'll need to migrate it. Here's a basic script structure:

```javascript
// migration-script.js
const admin = require("firebase-admin");
// Export data from Firebase
// Transform to D1 format
// Import to D1 via API calls
```

## Authentication Changes

The new authentication system uses JWT tokens instead of Firebase Auth:

- Login endpoint: `/api/auth/login`
- Token verification: `/api/auth/verify`
- Logout endpoint: `/api/auth/logout`

Default credentials:

- Email: admin@yoshida.co
- Password: admin123

## Database Changes

All database operations now use SQL queries instead of Firestore:

- Categories table: `categories`
- Products table: `products`
- News table: `news`
- Equipment table: `equipments`

## Troubleshooting

1. **Database connection issues**: Check that D1 binding is correctly set up
2. **Authentication issues**: Verify JWT_SECRET is set in environment variables
3. **API issues**: Check that all environment variables are properly set in Cloudflare Pages

## Security Notes

1. Change the default login credentials immediately after deployment
2. Use a strong JWT secret
3. Consider implementing proper user management for production use
