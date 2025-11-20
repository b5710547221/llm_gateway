#!/bin/bash

echo "🚀 Preparing for Vercel Deployment..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Test build locally
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Ready to deploy to Vercel."
  echo ""
  echo "Next steps:"
  echo "1. Set up PostgreSQL database (Vercel Postgres recommended)"
  echo "2. Add environment variables in Vercel dashboard:"
  echo "   - DATABASE_URL (PostgreSQL connection string)"
  echo "   - JWT_SECRET (32+ character random string)"
  echo "   - NEXT_PUBLIC_APP_URL (your Vercel domain)"
  echo "3. Deploy: git push or 'vercel --prod'"
  echo "4. After deployment, run: npx prisma db push"
  echo "5. Seed admin user: npx tsx prisma/seed.ts"
else
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi
