#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Book Management App — Production Deploy Script
# ─────────────────────────────────────────────────

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"

echo "📦 Book Management App — Production Deploy"
echo "==========================================="

# 1. Check prerequisites
echo ""
echo "➜ Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found"; exit 1; }
docker info >/dev/null 2>&1 || { echo "ERROR: Docker daemon not running"; exit 1; }
echo "  ✓ Docker is available"

# 2. Verify .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "ERROR: .env file not found at $APP_DIR/.env"
    echo "  Copy .env.production.example to .env and fill in values:"
    echo "  cp .env.production.example .env"
    exit 1
fi
echo "  ✓ .env file found"

# 3. Verify required variables
source "$APP_DIR/.env"
if [ -z "${MONGO_ROOT_PASSWORD:-}" ] || [ "$MONGO_ROOT_PASSWORD" = "CHANGE_ME_TO_A_STRONG_PASSWORD" ]; then
    echo "ERROR: Set a real MONGO_ROOT_PASSWORD in .env"
    exit 1
fi
echo "  ✓ Environment variables configured"

# 4. Build images
echo ""
echo "➜ Building Docker images..."
cd "$APP_DIR"
docker compose $COMPOSE_FILES build

# 5. Deploy
echo ""
echo "➜ Starting services..."
docker compose $COMPOSE_FILES up -d

# 6. Wait for health
echo ""
echo "➜ Waiting for services to become healthy..."
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    HEALTHY=$(docker compose $COMPOSE_FILES ps --format json 2>/dev/null | grep -c '"healthy"' || true)
    if [ "$HEALTHY" -ge 3 ]; then
        break
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo "  Waiting... (${ELAPSED}s)"
done

# 7. Verify
echo ""
echo "➜ Verifying deployment..."
docker compose $COMPOSE_FILES ps

BACKEND_STATUS=$(curl -sf http://localhost:5001/api/health 2>/dev/null || echo "DOWN")
FRONTEND_STATUS=$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:80 2>/dev/null || echo "DOWN")

echo ""
echo "  Backend:  $BACKEND_STATUS"
echo "  Frontend: HTTP $FRONTEND_STATUS"

if echo "$BACKEND_STATUS" | grep -q "ok" && [ "$FRONTEND_STATUS" = "200" ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "  Frontend: http://localhost (port 80)"
    echo "  Backend:  http://localhost:5001/api"
else
    echo ""
    echo "⚠️  Some services may not be ready yet."
    echo "  Check logs: docker compose $COMPOSE_FILES logs -f"
fi
