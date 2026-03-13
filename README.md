# Book Management App

A full-stack CRUD application for managing books, built with React, Express, and MongoDB — fully Dockerized with Docker Compose orchestration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 7 · TailwindCSS 4 · Axios · React Router 7 |
| Backend | Node.js 22 · Express 5 · Mongoose 8 · Helmet · express-rate-limit |
| Database | MongoDB 7 |
| Containerization | Docker · Docker Compose · Nginx (reverse proxy) |
| Testing | Jest 30 · Supertest 7 |

## Architecture

```
                    ┌─────────────────────┐
                    │    Frontend         │
                    │  React + Nginx      │
                    │  Port 3000 → :80    │
                    └──────────┬──────────┘
                               │ /api/ proxy
                    ┌──────────▼──────────┐
                    │    Backend          │
                    │  Express + Node.js  │
                    │  Port 5001          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    MongoDB          │
                    │  Internal :27017    │
                    │  (not exposed)      │
                    └─────────────────────┘
```

- **Nginx** serves the React SPA and proxies `/api/` requests to the backend
- **Network isolation**: Frontend ↔ Backend (`frontend-net`), Backend ↔ MongoDB (`backend-net`)
- MongoDB is **not exposed** to the host — only accessible within Docker

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Makefile Commands](#makefile-commands)
- [Docker Images](#docker-images)
- [Testing and Verification](#testing-and-verification)
- [Security](#security)
- [Deployment](#deployment)
  - [Development](#development)
  - [Staging](#staging)
  - [Production](#production)
- [Horizontal Scaling](#horizontal-scaling)
- [Monitoring](#monitoring)
- [Cleanup and Maintenance](#cleanup-and-maintenance)
- [Environment Variables](#environment-variables)

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/Kushagrakumar12/BookShelf.git
cd BookShelf

# Start everything
docker compose up -d --build

# Verify
docker compose ps
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Health check: http://localhost:5001/api/health/detailed

### Local Development (without Docker)

```bash
# Terminal 1: Start MongoDB locally
mongod --dbpath /tmp/mongodb-data

# Terminal 2: Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Project Structure

```
Book-Management-App/
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── controllers/bookController.js  # CRUD logic
│   │   ├── models/Book.js            # Mongoose schema
│   │   ├── routes/bookRoutes.js      # Express routes
│   │   └── server.js                 # App entry point
│   ├── tests/
│   │   ├── books.integration.test.js # 16 integration tests
│   │   └── setup.js                  # Test DB helpers
│   ├── Dockerfile                    # Multi-stage build (163MB)
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/bookApi.js            # Axios API layer
│   │   ├── context/ToastContext.jsx   # Toast notification system
│   │   ├── utils/bookHelpers.js      # Cover colors, genres, helpers
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── BookForm.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── BookList.jsx          # Home — list all books
│   │   │   ├── AddBook.jsx           # Create new book
│   │   │   ├── EditBook.jsx          # Edit existing book
│   │   │   ├── BookDetail.jsx        # Single book view
│   │   │   └── NotFound.jsx          # 404 page
│   │   ├── App.jsx                   # Router setup
│   │   ├── index.css                 # Tailwind + custom animations
│   │   └── main.jsx                  # Entry point
│   ├── nginx.conf                    # Nginx proxy + security headers
│   ├── Dockerfile                    # Multi-stage build (62MB)
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── docker-compose.yml                # Base (development)
├── docker-compose.staging.yml        # Staging overrides
├── docker-compose.prod.yml           # Production overrides
├── docker-compose.scale.yml          # Horizontal scaling
├── .env.staging.example              # Staging env template
├── .env.production.example           # Production env template
├── deploy.sh                         # Automated deploy script
├── monitor.sh                        # Monitoring dashboard
├── Makefile                          # 25+ convenience commands
└── .gitignore
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Basic health check |
| `GET` | `/api/health/detailed` | Detailed health (MongoDB, memory, uptime) |
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books/:id` | Get book by ID |
| `POST` | `/api/books` | Create a book |
| `PUT` | `/api/books/:id` | Update a book |
| `DELETE` | `/api/books/:id` | Delete a book |

### Book Schema

```json
{
  "title": "string (required)",
  "author": "string (required)",
  "description": "string (optional, default: '')",
  "publishedYear": "number (required, 1 to currentYear+5)",
  "genre": "string (optional, default: 'Uncategorized')",
  "createdAt": "ISO date (auto)",
  "updatedAt": "ISO date (auto)"
}
```

### Example Request

```bash
# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Docker Deep Dive", "author": "Nigel Poulton", "publishedYear": 2023, "genre": "Non-Fiction"}'

# List all books
curl http://localhost:3000/api/books

# Update a book
curl -X PUT http://localhost:3000/api/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Docker Deep Dive (2nd Ed)"}'

# Delete a book
curl -X DELETE http://localhost:3000/api/books/<id>
```

## Makefile Commands

Run `make help` to see all available commands:

### Build & Run

| Command | Description |
|---------|-------------|
| `make build` | Build all Docker images |
| `make build-clean` | Build from scratch (no cache) |
| `make up` | Start all services |
| `make up-build` | Build and start |
| `make down` | Stop containers (data preserved) |
| `make restart` | Restart all services |

### Monitoring

| Command | Description |
|---------|-------------|
| `make monitor` | Full monitoring dashboard |
| `make health` | Quick health check |
| `make health-detail` | Detailed health (JSON) |
| `make ps` | Container status |
| `make stats` | Live CPU/memory usage |
| `make logs` | Tail all logs |
| `make logs-backend` | Tail backend logs |
| `make logs-errors` | Show recent errors |

### Testing

| Command | Description |
|---------|-------------|
| `make test` | Run 16 integration tests |

### Cleanup

| Command | Description |
|---------|-------------|
| `make clean` | Stop + remove volumes (**deletes data**) |
| `make clean-images` | Remove project images |
| `make prune` | Remove unused Docker resources |
| `make disk` | Show Docker disk usage |

### Production

| Command | Description |
|---------|-------------|
| `make deploy` | Run automated deploy script |
| `make prod-up` | Start production stack |
| `make prod-down` | Stop production stack |

### Staging

| Command | Description |
|---------|-------------|
| `make stage-up` | Start staging stack (requires `.env.staging`) |
| `make stage-down` | Stop staging stack |
| `make stage-logs` | Tail staging logs |
| `make stage-ps` | Show staging container status |

### Scaling

| Command | Description |
|---------|-------------|
| `make scale-up` | Start with 3 backend replicas |
| `make scale-up REPLICAS=5` | Start with 5 replicas |
| `make scale-set REPLICAS=5` | Live scale (no downtime) |
| `make scale-down` | Stop scaled stack |

## Docker Images

| Image | Base | Size | Description |
|-------|------|------|-------------|
| `book-management-app-backend` | `node:22-alpine` | 163 MB | Express API server |
| `book-management-app-frontend` | `nginx:alpine` | 62 MB | React SPA + Nginx proxy |

Both use **multi-stage builds** to minimize image size.

## Testing and Verification

This section walks through how to completely verify the Dockerized application is working correctly, from building the images to testing every API endpoint.

---

### Step 1: Build the Docker Images

Build all images from their Dockerfiles. This must succeed before anything else.

```bash
docker compose build
```

Expected output — each service should print `=> exporting to image` and `=> writing image` with no errors:
```
[+] Building 12.4s (22/22) FINISHED
 => [backend] FROM docker.io/library/node:22-alpine
 => [frontend] FROM docker.io/library/node:22-alpine AS build
 => [mongo] ...
```

To force a completely clean rebuild (no cached layers):
```bash
docker compose build --no-cache
```

---

### Step 2: Start the Stack

Start all three services in detached (background) mode:

```bash
docker compose up -d --build
```

The `-d` flag runs containers in the background so your terminal is free. `--build` ensures images are built before starting.

---

### Step 3: Verify All Containers Are Running and Healthy

```bash
docker compose ps
```

All three containers must show `running (healthy)`. If any shows `running (unhealthy)` or `Exit`, do not proceed — check the logs (Step 7).

Expected output:
```
NAME            IMAGE                              STATUS
book-mongo      mongo:7                            running (healthy)
book-backend    book-management-app-backend        running (healthy)
book-frontend   book-management-app-frontend       running (healthy)
```

The `(healthy)` status means each container's `HEALTHCHECK` passed. The backend health check specifically hits `/api/health`, so a healthy backend means Express is running AND MongoDB is connected.

> Note: On first run, allow 20-30 seconds for MongoDB to initialize and all health checks to pass.

---

### Step 4: Verify the Health Endpoints

The backend exposes two health endpoints. Test both directly:

**Basic health check:**
```bash
curl http://localhost:5001/api/health
```
Expected response:
```json
{"status":"ok"}
```

**Detailed health check:**
```bash
curl http://localhost:5001/api/health/detailed
```
Expected response (values will differ):
```json
{
  "status": "ok",
  "timestamp": "2026-03-13T10:00:00.000Z",
  "uptime": "42s",
  "mongodb": {
    "status": "connected",
    "host": "mongo",
    "name": "books"
  },
  "memory": {
    "rss": "67MB",
    "heapUsed": "18MB",
    "heapTotal": "23MB"
  },
  "nodeVersion": "v22.x.x"
}
```

Key things to verify in this response:
- `"status": "ok"` — Express is running
- `"mongodb": { "status": "connected" }` — MongoDB connection is live
- `"host": "mongo"` — confirms the backend is talking to the Docker service, not localhost

---

### Step 5: Test Every API Endpoint

Test each endpoint individually to confirm the full request-response cycle works end to end.

**Create a book (POST):**
```bash
curl -s -X POST http://localhost:5001/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker Deep Dive","author":"Nigel Poulton","publishedYear":2023,"genre":"Technology"}' \
  | python3 -m json.tool
```
Expected: HTTP 201 with the created book including `_id`, `createdAt`, and `updatedAt` fields.

**List all books (GET):**
```bash
curl -s http://localhost:5001/api/books | python3 -m json.tool
```
Expected: HTTP 200 with an array containing the book just created.

**Get a single book by ID (GET):**
```bash
# Replace <id> with the _id from the create response
curl -s http://localhost:5001/api/books/<id> | python3 -m json.tool
```
Expected: HTTP 200 with the book object.

**Update a book (PUT):**
```bash
curl -s -X PUT http://localhost:5001/api/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker Deep Dive (Updated)","author":"Nigel Poulton","publishedYear":2023}' \
  | python3 -m json.tool
```
Expected: HTTP 200 with the updated title in the response.

**Delete a book (DELETE):**
```bash
curl -s -X DELETE http://localhost:5001/api/books/<id>
```
Expected: HTTP 200 with `{"message":"Book deleted successfully"}`.

**Confirm deletion (GET — should 404):**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/books/<id>
```
Expected: `404`

**Test validation (POST with missing fields):**
```bash
curl -s -X POST http://localhost:5001/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"No Author"}' \
  | python3 -m json.tool
```
Expected: HTTP 400 with an error message mentioning the missing field.

---

### Step 6: Verify the Frontend

**Check the frontend is served:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200`

**Verify Nginx proxies API requests through the frontend:**
```bash
# This request goes to the frontend's Nginx on port 3000,
# which proxies it internally to the backend on port 5001
curl -s http://localhost:3000/api/health | python3 -m json.tool
```
Expected: same `{"status":"ok"}` response as the direct backend call.

This confirms the full request path: Browser → Nginx (port 3000) → Express (port 5001) → MongoDB.

Open the app in a browser at **http://localhost:3000** and verify:
- [ ] The book list page loads
- [ ] You can add a new book via the form
- [ ] The new book appears in the list
- [ ] You can click into a book and see its details
- [ ] You can edit a book and save changes
- [ ] You can delete a book and see it removed

---

### Step 7: Run the Integration Tests

The integration test suite runs all CRUD operations against a live test database:

```bash
make test
# or directly:
cd backend && npm test
```

Expected output — all tests should pass:
```
PASS tests/books.integration.test.js
  Health Check
    ✓ GET /api/health should return status ok
  Book CRUD Operations
    POST /api/books
      ✓ should create a new book
      ✓ should fail to create a book without title
      ...
    Full CRUD Workflow
      ✓ should create, read, update, and delete a book

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

---

### Step 8: Inspect Logs

Check that each container is logging correctly and there are no errors:

```bash
# All services at once
docker compose logs

# Follow live logs
docker compose logs -f

# Individual services
docker compose logs backend
docker compose logs frontend
docker compose logs mongo
```

The backend produces structured JSON logs for every request:
```json
{"method":"GET","path":"/api/books","status":200,"duration":"12ms","timestamp":"2026-03-13T10:00:01.000Z"}
```

Look for:
- No `ERROR` or `FATAL` lines in the backend logs
- MongoDB log showing `Waiting for connections` on port 27017
- Nginx access log showing `200` responses

---

### Step 9: Verify Container Security Settings

Confirm the non-root user and read-only filesystem are active:

```bash
# Check which user the backend process runs as (should be 'appuser', NOT root)
docker exec book-backend whoami
```
Expected: `appuser`

```bash
# Confirm the filesystem is read-only (should fail with 'Read-only file system')
docker exec book-backend touch /test-write 2>&1
```
Expected: `touch: /test-write: Read-only file system`

```bash
# Confirm /tmp is writable (tmpfs mount)
docker exec book-backend touch /tmp/test-write && echo "writable" || echo "not writable"
```
Expected: `writable`

---

### Quick Verification Checklist

After running through the steps above, all of the following should be true:

| Check | Command | Expected |
|-------|---------|----------|
| All containers healthy | `docker compose ps` | `running (healthy)` for all 3 |
| Backend health | `curl localhost:5001/api/health` | `{"status":"ok"}` |
| MongoDB connected | `curl localhost:5001/api/health/detailed` | `"status":"connected"` |
| Create book | `POST /api/books` | HTTP 201 |
| List books | `GET /api/books` | HTTP 200, array |
| Update book | `PUT /api/books/:id` | HTTP 200 |
| Delete book | `DELETE /api/books/:id` | HTTP 200 |
| Frontend served | `curl localhost:3000` | HTTP 200 |
| Nginx proxy works | `curl localhost:3000/api/health` | `{"status":"ok"}` |
| Integration tests | `make test` | All 20 tests pass |
| Non-root user | `docker exec book-backend whoami` | `appuser` |
| Read-only fs | `docker exec book-backend touch /test-write` | Permission denied |

## Security

### User Privileges
Both containers run as a dedicated non-root user (`appuser`) created inside the Dockerfile:
- `addgroup -S appgroup && adduser -S appuser -G appgroup`
- All application files are owned by `appuser` before the `USER appuser` switch
- The backend container also runs with `read_only: true` filesystem — the only writable path is `/tmp` (mounted as `tmpfs`)

This means even if an attacker exploits a vulnerability in the app, they cannot write to the container filesystem or escalate to root.

### Image Scanning
Both Docker images can be scanned locally for known CVEs using **Trivy** — an open-source vulnerability scanner by Aqua Security.

```bash
# Install Trivy (macOS)
brew install trivy

# Scan the backend image
trivy image book-management-backend

# Scan the frontend image
trivy image book-management-frontend
```

Both images use `alpine`-based base images (`node:22-alpine`, `nginx:alpine`) which have a minimal attack surface and a small number of installed packages, keeping the vulnerability count low.

### Securing Environment Variables
Secrets are never baked into Docker images or committed to version control:

- **`.dockerignore`** — excludes `.env`, `.env.local`, and `.env.example` from both image build contexts. Even if accidentally present, they cannot be copied into an image.
- **`.gitignore`** — excludes all active secret files: `.env`, `.env.local`, `.env.staging`, `.env.production`. Only `.example` template files (which contain no real secrets) are committed.
- **Runtime injection** — real values are passed to containers at runtime via `docker-compose.yml` `environment:` blocks or `--env-file`, never inside Dockerfiles. The `ENV` instructions in Dockerfiles contain only safe, non-secret defaults.
- **Production guard** — `docker-compose.prod.yml` uses `${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD is required}` which causes Docker Compose to refuse to start if the variable is unset or empty, preventing accidental deployment with no database password.

### Backend
- **Helmet** — 11+ HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** — 100 requests per 15 minutes per IP
- **CORS restriction** — locked to configured origin
- **Body size limit** — 10KB max JSON payload

### Frontend (Nginx)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation disabled
- `server_tokens off` — Nginx version hidden
- Hidden file access blocked

### Infrastructure
- **Network isolation** — frontend cannot reach MongoDB directly
- **MongoDB not exposed** — internal-only (no host port mapping)
- **MongoDB authentication** — enabled in staging and production environments

## Deployment

The application ships with **three Docker Compose configurations**, one for each environment. Each environment builds on the base `docker-compose.yml` using override files.

| Environment | Compose files | Frontend port | MongoDB auth | Restart policy |
|-------------|--------------|---------------|--------------|----------------|
| Development | `docker-compose.yml` | 3000 | None | `unless-stopped` |
| Staging | `docker-compose.yml` + `docker-compose.staging.yml` | 8080 | Enabled | `unless-stopped` |
| Production | `docker-compose.yml` + `docker-compose.prod.yml` | 80 | Enabled | `always` |

---

### Development

Development uses the base `docker-compose.yml` with no authentication and default settings. Suitable for local work only.

```bash
# 1. Start all services (builds images on first run)
docker compose up -d --build

# 2. Verify all containers are healthy
docker compose ps

# Access the app
# Frontend:  http://localhost:3000
# API:       http://localhost:5001/api
# Health:    http://localhost:5001/api/health/detailed
```

No `.env` file is needed — the Dockerfiles provide safe defaults for local development.

To stop:
```bash
docker compose down          # stops containers, keeps data
docker compose down -v       # stops containers AND deletes database
```

---

### Staging

Staging mirrors the production configuration (MongoDB authentication, log rotation) but runs on a different port (8080) and uses a separate `books_staging` database so it can run on the same host without conflicting with production.

**Step 1 — Create the staging environment file:**

```bash
cp .env.staging.example .env.staging
```

Open `.env.staging` and set real values:

```bash
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=a-strong-staging-password
CORS_ORIGIN=http://localhost:8080
```

**Step 2 — Start the staging stack:**

```bash
make stage-up
# or directly:
docker compose --env-file .env.staging \
  -f docker-compose.yml \
  -f docker-compose.staging.yml \
  up -d --build
```

**Step 3 — Verify:**

```bash
make stage-ps
# Frontend: http://localhost:8080
# API:      http://localhost:5001/api/health
```

To stop:
```bash
make stage-down
```

---

### Production

Production enables MongoDB authentication, sets `restart: always` on all services, exposes the frontend on port 80, and adds log rotation to prevent disk fill.

**Step 1 — Create the production environment file:**

```bash
cp .env.production.example .env
```

Open `.env` and set real values:

```bash
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=a-very-strong-production-password
CORS_ORIGIN=https://yourdomain.com
```

> Never commit `.env` to version control. The `.gitignore` already excludes it.

**Step 2 — Deploy:**

```bash
make deploy
# or directly:
./deploy.sh
```

The `deploy.sh` script:
1. Checks Docker is installed and running
2. Confirms `.env` exists and `MONGO_ROOT_PASSWORD` is not the default placeholder
3. Builds all Docker images
4. Starts all services with production overrides
5. Waits for health checks to pass
6. Verifies frontend and API endpoints are reachable

**Step 3 — Verify:**

```bash
make prod-ps
curl http://localhost/api/health/detailed
# Frontend: http://localhost:80
```

To stop:
```bash
make prod-down
```

## Horizontal Scaling

The backend can be horizontally scaled behind Nginx's load balancer:

```bash
# Start with 3 backend replicas
make scale-up

# Live scale to 5 replicas (zero downtime)
make scale-set REPLICAS=5

# Scale down to 2
make scale-set REPLICAS=2
```

Nginx uses Docker's built-in DNS round-robin to distribute requests across replicas. Each replica has resource limits (0.5 CPU, 256MB memory).

## Monitoring

```bash
# Full dashboard
make monitor

# Detailed health
make health-detail

# Live resource usage
make stats

# Error logs
make logs-errors
```

### Detailed Health Endpoint

`GET /api/health/detailed` returns:
```json
{
  "status": "ok",
  "timestamp": "2026-03-10T10:36:00.526Z",
  "uptime": "188s",
  "mongodb": { "status": "connected", "host": "mongo", "name": "books" },
  "memory": { "rss": "67MB", "heapUsed": "18MB", "heapTotal": "19MB" },
  "nodeVersion": "v22.x.x"
}
```

### Structured Request Logging

Every request produces a JSON log entry:
```json
{"method":"GET","path":"/api/books","status":200,"duration":"28ms","timestamp":"2026-03-10T10:33:35.620Z"}
```

## Cleanup and Maintenance

Docker accumulates resources over time: stopped containers, old images, unused volumes, and build cache. Left unchecked these can consume significant disk space. The commands below cover every level of cleanup, from the safest to the most aggressive.

### Check Disk Usage First

Always start here to understand what is consuming space before deleting anything:

```bash
make disk
# or directly:
docker system df
```

Example output:
```
TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
Images          4       2        612MB     350MB (57%)
Containers      3       3        0B        0B
Local Volumes   1       1        42MB      0B
Build Cache     12      0        180MB     180MB
```

This shows you exactly what is taking space and how much is safe to reclaim.

---

### Level 1 — Stop Containers (non-destructive)

Stops all running containers. All data is preserved. Images are kept. You can start again with `make up`.

```bash
make down
# or directly:
docker compose down
```

Use this when you want to stop the app temporarily — for example, at the end of a work session.

---

### Level 2 — Remove Containers and Volumes (deletes database data)

> **Warning: this deletes all book data stored in MongoDB.** The database cannot be recovered after this command.

Stops containers, removes them, and deletes the `mongo-data` volume (the database files).

```bash
make clean
# or directly:
docker compose down -v --remove-orphans
```

Use this when you want a completely fresh start — for example, to reset the database to empty, or to fix a corrupted database state.

---

### Level 3 — Remove Containers, Volumes, and Project Images

> **Warning: deletes all data AND removes the built Docker images.**

Stops everything and removes the `book-management-backend` and `book-management-frontend` images. The next `make up --build` will rebuild them from scratch (takes a few minutes).

```bash
make clean-images
# or directly:
docker compose down --rmi all -v --remove-orphans
```

Use this when you want to force a full image rebuild — for example, after changing a Dockerfile or when troubleshooting a broken image.

---

### Level 4 — Remove Dangling Docker Resources (safe system-wide cleanup)

Removes Docker resources that are not attached to any container: dangling images (untagged build leftovers), stopped containers, unused networks, and build cache. Does **not** delete named volumes or running containers.

```bash
make prune
# or directly:
docker system prune -f
```

This is safe to run at any time. It frees build cache and leftover layers from previous builds without touching your running app or its data.

---

### Level 5 — Remove All Unused Docker Resources (aggressive)

> **Warning: removes ALL unused images, volumes, and networks system-wide** — not just this project. This will prompt for confirmation.

```bash
make prune-all
# or directly:
docker system prune -a --volumes -f
```

Use this only when doing a full Docker cleanup on your machine. Any image that is not currently used by a running container will be deleted — including images from other projects.

---

### Recommended Cleanup Workflow

```
Daily use             → make down / make up
Fresh database        → make clean  (⚠ deletes data)
Rebuild images        → make clean-images  (⚠ deletes data + images)
Free disk space       → make prune  (safe)
Full machine cleanup  → make prune-all  (⚠ aggressive, affects all projects)
```

Quick reference of all cleanup commands:

| Command | Removes containers | Removes volumes (data) | Removes images | Scope |
|---|---|---|---|---|
| `make down` | ✅ | ❌ | ❌ | This project |
| `make clean` | ✅ | ✅ ⚠ | ❌ | This project |
| `make clean-images` | ✅ | ✅ ⚠ | ✅ | This project |
| `make prune` | Stopped only | ❌ | Dangling only | System-wide |
| `make prune-all` | Stopped only | ✅ ⚠ | All unused ⚠ | System-wide |

---

## Environment Variables

The application uses environment files that are different depending on the environment. Never commit files with real secrets — all active `.env.*` files are excluded by `.gitignore`. Only `.example` template files are committed.

---

### Development

No setup required. The Dockerfiles contain built-in defaults that work out of the box for local development:

| Variable | Default in Dockerfile | Description |
|----------|-----------------------|-------------|
| `PORT` | `5001` | Express server port |
| `NODE_ENV` | `production` | Environment mode |
| `MONGO_URI` | `mongodb://mongo:27017/books` | MongoDB connection string (uses Docker service name) |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin allowed by CORS |

> For local development **without** Docker, copy `backend/.env.example` to `backend/.env` and change `MONGO_URI` to `mongodb://localhost:27017/books`.

**Frontend:**

| Variable | Value in Docker build | Description |
|----------|-----------------------|-------------|
| `VITE_API_URL` | `/api` | API base URL — baked into the JS bundle at build time, set to a relative path so Nginx can proxy it |

> For local development without Docker, copy `frontend/.env.example` to `frontend/.env`. The default `VITE_API_URL=http://localhost:5001/api` points directly to the backend port.

---

### Staging

Copy the template and fill in real values:

```bash
cp .env.staging.example .env.staging
```

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `MONGO_ROOT_USER` | `admin` | No | MongoDB admin username |
| `MONGO_ROOT_PASSWORD` | — | **Yes** | MongoDB admin password — Docker Compose refuses to start without it |
| `CORS_ORIGIN` | `http://localhost:8080` | No | Frontend URL allowed by CORS |

The staging stack reads this file via `--env-file .env.staging` in the `STAGING_COMPOSE` variable in `Makefile`.

---

### Production

Copy the template and fill in real values:

```bash
cp .env.production.example .env
```

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `MONGO_ROOT_USER` | `admin` | No | MongoDB admin username |
| `MONGO_ROOT_PASSWORD` | — | **Yes** | MongoDB admin password — Docker Compose refuses to start without it |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Set to your real domain, e.g. `https://yourdomain.com` |

The production stack reads `.env` from the project root automatically (Docker Compose default).

> Never commit `.env` or `.env.staging` to version control. Both are listed in `.gitignore`.

## License

ISC
