#!/bin/bash

echo "🔄 Rebuilding and redeploying Docker containers..."

# Stop and remove containers
docker-compose --env-file .env.docker down

# Rebuild images
docker-compose --env-file .env.docker build --no-cache

# Start containers
docker-compose --env-file .env.docker up -d

echo "✅ Rebuild complete!"
echo ""
echo "📱 Application: http://localhost:3000"
echo "🌐 Nginx Proxy: http://localhost:80"
echo ""
echo "📝 View logs: docker-compose logs -f app"
