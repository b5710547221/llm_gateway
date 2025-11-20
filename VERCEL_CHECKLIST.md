# ✅ Vercel Deployment Checklist

## Pre-Deployment

- [x] Build passes locally ✅
- [x] All routes configured (static/dynamic) ✅
- [x] RAG MapIterator issue fixed ✅
- [x] Suspense boundaries added ✅
- [x] Code pushed to GitHub ✅

## Deployment Steps

### 1. Update Database Provider (CRITICAL!)

Edit `prisma/schema.prisma` line 9:
```diff
- provider = "sqlite"
+ provider = "postgresql"
```

### 2. Create PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
- Vercel Dashboard → Storage → Create Database → Postgres
- DATABASE_URL is automatically added to your environment

**Option B: External Provider**
- Supabase: https://supabase.com (free tier)
- Neon: https://neon.tech (free tier)
- Railway: https://railway.app

### 3. Set Environment Variables in Vercel

Go to: Project Settings → Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=super-secure-random-string-min-32-chars
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Optional (for email):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@ai-sec.com
```

### 4. Deploy

**Via GitHub (Automatic)**
```bash
git push origin master
# Vercel auto-deploys
```

**Via Vercel CLI**
```bash
vercel --prod
```

### 5. Post-Deployment

**Migrate Database:**
```bash
# Pull environment variables
vercel env pull

# Run migration
npx prisma db push
```

**Create Admin User:**
```bash
npx tsx prisma/seed.ts
```

Or manually:
```sql
INSERT INTO "User" (id, email, name, password, role, "emailVerified")
VALUES (
  'admin-001',
  'admin@yourdomain.com', 
  'Admin',
  -- Hash 'admin123' using bcrypt
  '$2a$12$LQ1KnIQYXgGJZ4qKnx7vReR.n7g0hCGRWzX6ZqY3rQ8Z9Y3Y9Y3Y9',
  'admin',
  true
);
```

### 6. Test Deployment

- [ ] Visit Vercel URL
- [ ] Login works
- [ ] Gateway accessible
- [ ] Admin dashboard (admin only)
- [ ] Query submission works
- [ ] Guardrails active

## Common Issues

**Build Error: Prisma provider mismatch**
→ Change schema to `postgresql` before deployment

**Runtime Error: DATABASE_URL not found**
→ Add DATABASE_URL in Vercel environment variables

**Error: Can't connect to database**
→ Verify PostgreSQL connection string format

**JWT errors**
→ Set JWT_SECRET in environment variables

## Success Criteria

✅ Build completes without errors
✅ App loads at Vercel URL
✅ Can login with admin credentials
✅ Gateway accepts queries
✅ Guardrails working
✅ Admin dashboard accessible

---

**Current Status:** Ready for deployment! 🚀
**Build:** ✅ Passing
**Database Schema:** ⚠️ Change to PostgreSQL before deploy
