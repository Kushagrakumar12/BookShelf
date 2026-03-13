.PHONY: help build up down restart logs ps test clean clean-all prune deploy prod-up prod-down prod-logs stage-up stage-down stage-logs stage-ps

# Default target
help: ## Show this help
	@echo "Book Management App — Docker Commands"
	@echo "======================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ──────────────── Build & Run ────────────────

build: ## Build all Docker images
	docker compose build

build-clean: ## Build images from scratch (no cache)
	docker compose build --no-cache

up: ## Start all services in background
	docker compose up -d

up-build: ## Build and start all services
	docker compose up -d --build

down: ## Stop and remove containers (data preserved)
	docker compose down

restart: ## Restart all services
	docker compose down && docker compose up -d

# ──────────────── Monitoring ────────────────

logs: ## Tail logs from all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

logs-mongo: ## Tail MongoDB logs
	docker compose logs -f mongo

ps: ## Show running containers and status
	docker compose ps

stats: ## Show live resource usage
	docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

monitor: ## Run monitoring dashboard
	./monitor.sh

health-detail: ## Show detailed backend health
	@curl -sf http://localhost:5001/api/health/detailed | python3 -m json.tool || echo "Backend is DOWN"

logs-errors: ## Show recent error logs
	docker compose logs --tail=200 2>/dev/null | grep -iE "error|ERR|fail|exception|fatal" | tail -30 || echo "No errors found"

# ──────────────── Testing ────────────────

test: ## Run integration tests
	cd backend && npm test

health: ## Check health of all services
	@echo "Backend:  $$(curl -sf http://localhost:5001/api/health || echo 'DOWN')"
	@echo "Frontend: $$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'DOWN')"

# ──────────────── Cleanup ────────────────

clean: ## Stop containers and remove volumes (DELETES DATA)
	docker compose down -v --remove-orphans

clean-images: ## Remove project images
	docker compose down --rmi all -v --remove-orphans

prune: ## Remove unused Docker resources (dangling)
	docker system prune -f

prune-all: ## Remove ALL unused Docker resources (aggressive)
	@echo "WARNING: This removes all unused images, volumes, and networks."
	@read -p "Continue? [y/N] " confirm && [ "$$confirm" = "y" ] && docker system prune -a --volumes -f || echo "Cancelled."

disk: ## Show Docker disk usage
	docker system df

# ──────────────── Production ────────────────

PROD_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.prod.yml

deploy: ## Deploy to production (runs deploy.sh)
	./deploy.sh

prod-up: ## Start production stack
	$(PROD_COMPOSE) up -d --build

prod-down: ## Stop production stack
	$(PROD_COMPOSE) down

prod-logs: ## Tail production logs
	$(PROD_COMPOSE) logs -f

prod-ps: ## Show production container status
	$(PROD_COMPOSE) ps

# ──────────────── Staging ────────────────

STAGING_COMPOSE = docker compose --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml

stage-up: ## Start staging stack (requires .env.staging)
	$(STAGING_COMPOSE) up -d --build

stage-down: ## Stop staging stack
	$(STAGING_COMPOSE) down

stage-logs: ## Tail staging logs
	$(STAGING_COMPOSE) logs -f

stage-ps: ## Show staging container status
	$(STAGING_COMPOSE) ps

# ──────────────── Scaling ────────────────

SCALE_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.scale.yml
REPLICAS ?= 3

scale-up: ## Start with scaled backend (default: 3 replicas)
	BACKEND_REPLICAS=$(REPLICAS) $(SCALE_COMPOSE) up -d --build

scale-down: ## Stop scaled stack
	$(SCALE_COMPOSE) down

scale-set: ## Change replica count (usage: make scale-set REPLICAS=5)
	BACKEND_REPLICAS=$(REPLICAS) $(SCALE_COMPOSE) up -d --scale backend=$(REPLICAS) --no-recreate

scale-ps: ## Show scaled container status
	$(SCALE_COMPOSE) ps
