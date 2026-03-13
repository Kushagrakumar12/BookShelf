#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Book Management App — Monitoring Dashboard
# ─────────────────────────────────────────────────

BOLD='\033[1m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
CYAN='\033[36m'
NC='\033[0m'

header() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}"; }

# ──────── Container Status ────────
header "Container Status"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"

# ──────── Resource Usage ────────
header "Resource Usage"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null || echo "No containers running"

# ──────── Health Checks ────────
header "Health Checks"

BACKEND_HEALTH=$(curl -sf http://localhost:5001/api/health/detailed 2>/dev/null || echo '{"status":"DOWN"}')
BACKEND_STATUS=$(echo "$BACKEND_HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','DOWN'))" 2>/dev/null || echo "DOWN")

if [ "$BACKEND_STATUS" = "ok" ]; then
    echo -e "  Backend API:  ${GREEN}● HEALTHY${NC}"
    DETAIL=$(echo "$BACKEND_HEALTH" | python3 -c "
import sys,json
h=json.load(sys.stdin)
print(f\"    Uptime: {h.get('uptime','?')}  |  MongoDB: {h.get('mongodb',{}).get('status','?')}  |  Memory: {h.get('memory',{}).get('rss','?')}\")" 2>/dev/null || echo "    (details unavailable)")
    echo "$DETAIL"
else
    echo -e "  Backend API:  ${RED}● DOWN${NC}"
fi

FRONTEND_CODE=$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_CODE" = "200" ]; then
    echo -e "  Frontend:     ${GREEN}● HEALTHY${NC} (HTTP $FRONTEND_CODE)"
else
    echo -e "  Frontend:     ${RED}● DOWN${NC} (HTTP $FRONTEND_CODE)"
fi

MONGO_STATUS=$(docker exec book-mongo mongosh --quiet --eval 'db.runCommand("ping").ok' 2>/dev/null || echo "0")
if [ "$MONGO_STATUS" = "1" ]; then
    echo -e "  MongoDB:      ${GREEN}● HEALTHY${NC}"
else
    echo -e "  MongoDB:      ${RED}● DOWN${NC}"
fi

# ──────── Recent Logs (Errors) ────────
header "Recent Errors (last 20 lines)"
ERRORS=$(docker compose logs --tail=100 2>/dev/null | grep -iE "error|ERR|fail|exception|fatal" | tail -20 || true)
if [ -z "$ERRORS" ]; then
    echo -e "  ${GREEN}No errors found${NC}"
else
    echo -e "  ${RED}$ERRORS${NC}"
fi

# ──────── Docker Disk Usage ────────
header "Docker Disk Usage"
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}" 2>/dev/null

# ──────── Image Info ────────
header "Project Images"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}" | grep -E "book-management|REPOSITORY" 2>/dev/null

echo ""
