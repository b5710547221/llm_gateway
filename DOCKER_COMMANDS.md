# Docker Quick Commands

## First Time Deployment
```bash
./deploy-docker.sh
```

## Rebuild After Code Changes
```bash
./rebuild-docker.sh
```

## Manual Commands

### View Logs
```bash
# All services
docker-compose logs -f

# App only
docker-compose logs -f app

# Database only  
docker-compose logs -f postgres
```

### Manage Containers
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Restart app only
docker-compose restart app
```

### Database Operations
```bash
# Run migration
docker-compose exec app npx prisma db push

# Seed database
docker-compose exec app npx tsx prisma/seed.ts

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Access PostgreSQL
docker-compose exec postgres psql -U aisec -d aisec_db
```

### Shell Access
```bash
# App container
docker-compose exec app sh

# Database container
docker-compose exec postgres sh
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove with volumes (deletes data!)
docker-compose down -v

# Remove images too
docker-compose down --rmi all

# Complete cleanup
docker system prune -a --volumes
```

## Access Points

- **Application**: http://localhost:3000
- **Nginx Proxy**: http://localhost:80
- **Database Admin** (with --profile debug): http://localhost:8080

## Default Credentials

- **Admin**: admin@ai-sec.com / admin123
- **User**: user@ai-sec.com / user123

## Troubleshooting

### Check Container Status
```bash
docker-compose ps
```

### Check Container Health
```bash
docker-compose exec app wget -q --spider http://localhost:3000/api/health && echo "Healthy" || echo "Unhealthy"
```

### View Environment Variables
```bash
docker-compose exec app env
```

### Rebuild Single Service
```bash
docker-compose build app
docker-compose up -d app
```
