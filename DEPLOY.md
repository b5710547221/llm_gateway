# 🚀 Quick Vercel Deployment Steps

## 1. Set Up Database

**Use Vercel Postgres (Easiest)**
```bash
# In Vercel Dashboard
Storage → Create Database → Postgres
# Copy DATABASE_URL automatically
```

**Or use external PostgreSQL:**
- Supabase (free): https://supabase.com
- Neon (free): https://neon.tech
- Railway: https://railway.app

## 2. Required Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-random-secret-minimum-32-characters
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 3. Deploy

**Via GitHub (Recommended)**
```bash
git push origin master
# Auto-deploys on Vercel
```

**Via Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

## 4. After Deployment

**Run database migration:**
```bash
# If using Vercel Postgres
vercel env pull
npx prisma db push

# Or use Vercel CLI
vercel exec -- npx prisma db push
```

**Create admin user:**
Option 1 - Use seed script:
```bash
npx tsx prisma/seed.ts
# Creates: admin@ai-sec.com / admin123
```

Option 2 - Manual via Prisma Studio:
```bash
npx prisma studio
# Add user with role="admin"
```

## 5. Test

1. Visit your Vercel URL
2. Login: `admin@ai-sec.com` / `admin123`
3. Access admin dashboard
4. Test AI gateway

## Common Issues

**Build Error: "Cannot find @prisma/client"**
- Solution: Added `postinstall` script, will auto-fix

**Runtime Error: "Database connection failed"**
- Check DATABASE_URL in Vercel env vars
- Ensure PostgreSQL (not SQLite)

**Error: "Invalid JWT"**
- Add JWT_SECRET in Vercel env vars (32+ chars)

## Production Checklist

- ✅ PostgreSQL database created
- ✅ DATABASE_URL environment variable set
- ✅ JWT_SECRET environment variable set
- ✅ Schema migrated (`prisma db push`)
- ✅ Admin user created
- ✅ App tested

---

**Need help?** See `VERCEL_DEPLOYMENT.md` for detailed instructions.
