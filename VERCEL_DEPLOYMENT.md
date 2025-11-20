# AI-Sec Vercel Deployment Guide

## Environment Variables Required

In your Vercel dashboard, add these environment variables:

### Required
```
DATABASE_URL=your-postgresql-url-here
JWT_SECRET=your-secure-random-secret-min-32-chars
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional (for email functionality)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@ai-sec.com
```

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Choose Postgres
3. Copy the `DATABASE_URL` to environment variables
4. Vercel will automatically set up the connection

### Option 2: External PostgreSQL
Use any PostgreSQL provider:
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app
- **Neon**: https://neon.tech
- **PlanetScale**: https://planetscale.com

Connection string format:
```
postgresql://user:password@host:5432/database?schema=public
```

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Deploy via Git (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

### 3. Deploy via CLI
```bash
vercel --prod
```

## Post-Deployment

### 1. Run Database Migration
After first deployment, run:
```bash
npx prisma db push
```
Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma db push
```

### 2. Seed Admin User
Create admin user in production database:
```bash
# Option 1: Via Prisma Studio
npx prisma studio

# Option 2: Via seed script
npx tsx prisma/seed.ts
```

Or manually create admin via SQL:
```sql
INSERT INTO "User" (id, email, name, password, role, "emailVerified") 
VALUES (
  'admin-001',
  'admin@yourdomain.com',
  'Admin',
  '$2a$12$YOUR_BCRYPT_HASH',  -- Use bcrypt to hash 'admin123'
  'admin',
  true
);
```

### 3. Test Deployment
1. Visit your Vercel URL
2. Login with admin credentials
3. Test gateway functionality
4. Check admin dashboard

## Troubleshooting

### Build Fails
- **Error**: "Cannot find module '@prisma/client'"
  - **Fix**: Environment variables set? Run `prisma generate` locally
  
- **Error**: "Database connection failed"
  - **Fix**: Check `DATABASE_URL` in Vercel environment variables

### Runtime Errors
- **Error**: "Invalid JWT token"
  - **Fix**: Ensure `JWT_SECRET` is set in Vercel

- **Error**: "Email not sending"
  - **Fix**: SMTP variables optional, won't break app

### Database Issues
- **SQLite won't work on Vercel** (read-only filesystem)
  - Must use PostgreSQL or other external database
  
- **Need to migrate schema**:
  ```bash
  vercel env pull .env.production
  npx prisma db push
  ```

## Important Notes

1. **SQLite not supported on Vercel** - Use PostgreSQL
2. **Set JWT_SECRET** - Generate secure random string (32+ chars)
3. **Update NEXT_PUBLIC_APP_URL** - Use your Vercel domain
4. **Email is optional** - App works without SMTP configuration
5. **Create admin user** - Use seed script or manual SQL after deployment

## Production Checklist

- [ ] PostgreSQL database configured
- [ ] DATABASE_URL environment variable set
- [ ] JWT_SECRET environment variable set (32+ chars)
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] Database schema migrated (`prisma db push`)
- [ ] Admin user created
- [ ] Test login functionality
- [ ] Test gateway queries
- [ ] Verify admin dashboard access

## Security Recommendations

1. Use strong JWT_SECRET (minimum 32 characters, random)
2. Enable HTTPS (automatic on Vercel)
3. Review CORS settings if using custom API
4. Set up monitoring and error tracking
5. Regular database backups
6. Implement rate limiting for production

## Support

For deployment issues:
1. Check Vercel build logs
2. Review environment variables
3. Test database connection
4. Verify Prisma schema is generated
