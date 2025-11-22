#!/bin/bash

set -e

echo "🐳 AI-Sec Docker Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}⚠️  .env.docker not found. Creating from template...${NC}"
    cp .env.docker.example .env.docker 2>/dev/null || echo "Please create .env.docker file"
fi

# Update Prisma schema for PostgreSQL
echo -e "${YELLOW}📝 Updating Prisma schema for PostgreSQL...${NC}"
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    else
        sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    fi
    echo -e "${GREEN}✅ Schema updated to PostgreSQL${NC}"
fi

# Build and start containers
echo -e "${GREEN}🔨 Building Docker images...${NC}"
docker-compose --env-file .env.docker build

echo -e "${GREEN}🚀 Starting containers...${NC}"
docker-compose --env-file .env.docker up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 15

# Run database migration
echo -e "${GREEN}📊 Running database migration...${NC}"
docker-compose --env-file .env.docker exec -T app npx prisma db push --skip-generate || echo "Migration may have already run"

# Seed database
echo -e "${GREEN}🌱 Seeding database with admin user...${NC}"
docker-compose --env-file .env.docker exec -T app npx tsx prisma/seed.ts || echo "Seed completed or users already exist"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "📱 Application: ${GREEN}http://localhost:3000${NC}"
echo -e "🗄️  Database Admin (optional): ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "🔐 Default Admin Credentials:"
echo -e "   Email: ${YELLOW}admin@ai-sec.com${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "📝 To view logs: ${YELLOW}docker-compose logs -f app${NC}"
echo -e "🛑 To stop: ${YELLOW}docker-compose down${NC}"
echo -e "🔄 To restart: ${YELLOW}docker-compose restart${NC}"
echo ""
