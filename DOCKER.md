# 🐳 Docker Deployment Guide

## Quick Start

### 1. Prerequisites

- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (usually comes with Docker Desktop)

### 2. Deploy with One Command

```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

This will:
- Update Prisma schema to PostgreSQL
- Build Docker images
- Start PostgreSQL database
- Start Next.js application
- Run database migrations
- Seed admin user

### 3. Access Application

- **App**: http://localhost:3000
- **Database UI** (Adminer): http://localhost:8080
- **Admin Login**: `admin@ai-sec.com` / `admin123`

## Manual Deployment

### Step 1: Configure Environment

Copy and edit environment file:
```bash
cp .env.docker .env.docker.local
nano .env.docker.local
```

Update these critical values:
```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-32-char-minimum-secret-key
NEXT_PUBLIC_APP_URL=http://your-domain.com
```

### Step 2: Update Prisma Schema

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}
```

### Step 3: Build and Start

```bash
# Build images
docker-compose --env-file .env.docker.local build

# Start services
docker-compose --env-file .env.docker.local up -d

# Check status
docker-compose ps
```

### Step 4: Database Setup

```bash
# Run migration
docker-compose exec app npx prisma db push

# Seed admin user
docker-compose exec app npx tsx prisma/seed.ts
```

## Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# App only
docker-compose logs -f app

# Database only
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart app only
docker-compose restart app
```

### Stop and Remove
```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes data!)
docker-compose down -v
```

### Shell Access
```bash
# App container
docker-compose exec app sh

# Database container
docker-compose exec postgres psql -U aisec -d aisec_db
```

## Database Management

### Using Adminer (Web UI)

1. Start with debug profile:
```bash
docker-compose --profile debug up -d
```

2. Open http://localhost:8080
3. Login:
   - System: PostgreSQL
   - Server: postgres
   - Username: aisec (from .env)
   - Password: (from .env)
   - Database: aisec_db

### Using psql (Command Line)

```bash
docker-compose exec postgres psql -U aisec -d aisec_db

# Example queries
\dt                          # List tables
SELECT * FROM "User";        # View users
\q                           # Quit
```

### Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U aisec aisec_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U aisec -d aisec_db < backup.sql
```

## Production Deployment

### 1. Security Checklist

- [ ] Change `POSTGRES_PASSWORD` to strong password
- [ ] Generate secure `JWT_SECRET` (32+ characters)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure SMTP for email (optional)
- [ ] Use Docker secrets for sensitive data
- [ ] Enable HTTPS/SSL (use reverse proxy)
- [ ] Set up firewall rules
- [ ] Regular database backups

### 2. Using Docker Secrets (Recommended)

Create secrets:
```bash
echo "secure-password" | docker secret create postgres_password -
echo "jwt-secret-key" | docker secret create jwt_secret -
```

Update `docker-compose.yml`:
```yaml
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password

secrets:
  postgres_password:
    external: true
  jwt_secret:
    external: true
```

### 3. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Auto-restart with Docker

Update `docker-compose.yml`:
```yaml
services:
  app:
    restart: always
  postgres:
    restart: always
```

## Monitoring

### Health Checks

```bash
# Check app health
curl http://localhost:3000/api/health

# Check database
docker-compose exec postgres pg_isready
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### App Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Database not ready - wait longer
# 2. Port 3000 in use - change APP_PORT
# 3. Missing .env - create .env.docker
```

### Database Connection Failed

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection
docker-compose exec app npx prisma db pull
```

### Migration Failed

```bash
# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
docker-compose exec app npx prisma db push
```

### Port Already in Use

Edit `.env.docker`:
```env
APP_PORT=3001        # Change from 3000
POSTGRES_PORT=5433   # Change from 5432
```

## Scaling

### Multiple App Instances

```bash
docker-compose up -d --scale app=3
```

Use nginx for load balancing:
```nginx
upstream ai_sec {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build app
docker-compose up -d app

# Run migrations
docker-compose exec app npx prisma db push
```

### Database Maintenance

```bash
# Vacuum database
docker-compose exec postgres psql -U aisec -d aisec_db -c "VACUUM ANALYZE;"

# Check database size
docker-compose exec postgres psql -U aisec -d aisec_db -c "\l+"
```

## Complete Cleanup

```bash
# Remove everything (containers, volumes, images)
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a --volumes
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| POSTGRES_USER | Database username | aisec | Yes |
| POSTGRES_PASSWORD | Database password | - | Yes |
| POSTGRES_DB | Database name | aisec_db | Yes |
| DATABASE_URL | Full connection string | auto-generated | Yes |
| JWT_SECRET | JWT signing key | - | Yes |
| NEXT_PUBLIC_APP_URL | Application URL | http://localhost:3000 | Yes |
| SMTP_HOST | Email server | smtp.gmail.com | No |
| SMTP_PORT | Email port | 587 | No |
| SMTP_USER | Email username | - | No |
| SMTP_PASS | Email password | - | No |

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify env variables: `docker-compose config`
3. Check health: `docker-compose ps`
4. Review this guide's troubleshooting section
