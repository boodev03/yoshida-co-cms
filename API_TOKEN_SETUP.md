# 🔑 Cloudflare API Token Setup

## Fix the "Forbidden" Error

Your project is configured for **real production D1 database**, but needs a proper API token.

## Step-by-Step Setup

### 1. Create API Token
1. Go to: **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"**
3. Choose **"Custom token"**

### 2. Set Permissions
Configure exactly these permissions:

**Account:**
- `Cloudflare D1:Edit`

**Zone Resources:**
- `Include: All zones`

### 3. Update Environment
Copy the generated token and update your `.env.local`:

```env
CLOUDFLARE_API_TOKEN=your-actual-api-token-here
```

Replace the current token (`2kiuF2lHy2pJZ1VVi1opfrqA3mx7XdYsio87wqnP`) with your new one.

### 4. Test Connection
```bash
npm run dev
```

The database should now connect successfully to your production D1 database!

## ✅ What This Enables

- Real database operations on your `yoshida-cor` D1 database
- Production-grade data persistence
- All CRUD operations working with actual data
- No mock or temporary solutions

## 🎯 Your Database

- **Database ID**: `4f5dd730-05ef-4f74-addd-b4e1a34e7cf5`
- **Database Name**: `yoshida-cor` 
- **Tables**: `categories`, `products`, `news`, `equipments`
- **Sample Data**: Already loaded

## 🚀 Ready for Production

Once the API token is configured, your CMS will use the real production database for all operations.