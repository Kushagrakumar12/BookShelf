# Book Management App — Testing & Deployment Summary

---

## 1. Integration Test Results

**Command run:** `cd backend && npm test`
**Test runner:** Jest + Supertest
**Database:** mongodb-memory-server (in-memory MongoDB)
**Date:** 2026-03-13

```
PASS  tests/books.integration.test.js

  Health Check
    ✓ GET /api/health should return status ok (18ms)

  Book CRUD Operations
    POST /api/books
      ✓ should create a new book (11ms)
      ✓ should fail to create a book without title (2ms)
      ✓ should fail to create a book without author (2ms)
      ✓ should fail to create a book without publishedYear (2ms)
      ✓ should fail to create a book with negative publishedYear (2ms)
      ✓ should fail to create a book with publishedYear too far in the future (2ms)
    GET /api/books
      ✓ should return empty array when no books (11ms)
      ✓ should return all books (8ms)
      ✓ should return books sorted by newest first (16ms)
    GET /api/books/:id
      ✓ should return a single book by ID (11ms)
      ✓ should return 404 for non-existent book (3ms)
      ✓ should return 400 for invalid ID format (2ms)
    PUT /api/books/:id
      ✓ should update an existing book (15ms)
      ✓ should return 404 when updating non-existent book (4ms)
    DELETE /api/books/:id
      ✓ should delete an existing book (11ms)
      ✓ should return 404 when deleting non-existent book (3ms)
    Full CRUD Workflow
      ✓ should create, read, update, and delete a book (28ms)

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        0.889s
```

**Result: All 18 tests passed. 0 failures.**

---

## 2. Docker Image Build Results

**Command run:** `docker compose up -d --build`

Both images were built successfully using multi-stage builds:

```
#2  [backend]  load build definition from Dockerfile      ✓
#3  [frontend] load build definition from Dockerfile      ✓
#18 [backend]  npm ci --only=production                   ✓ (cached)
#23 [frontend] npm ci                                     ✓ (cached)
#28 [frontend] npm run build                              ✓ (cached)
#33 [backend]  exporting to image                         ✓
#32 [frontend] exporting to image                         ✓

Image book-management-app-backend   Built ✓
Image book-management-app-frontend  Built ✓
```

**Built images:**

| Repository | Tag | Size | Created |
|---|---|---|---|
| book-management-app-frontend | latest | 62.1MB | 2026-03-13 |
| book-management-app-backend | latest | 163MB | 2026-03-13 |

---

## 3. Deployment Results

**Command run:** `docker compose up -d --build`

All three containers started and passed their health checks:

```
Container book-mongo      Running  → Waiting → Healthy ✓
Container book-backend    Running  → Waiting → Healthy ✓
Container book-frontend   Running  →           Healthy ✓
```

**Container Status:**

```
NAME            IMAGE                          STATUS                    PORTS
book-backend    book-management-app-backend    Up 19 minutes (healthy)   0.0.0.0:5001->5001/tcp
book-frontend   book-management-app-frontend   Up 3 hours    (healthy)   0.0.0.0:3000->80/tcp
book-mongo      mongo:7                        Up 3 hours    (healthy)   0.0.0.0:27017->27017/tcp
```

All containers show status `(healthy)` — Docker's internal health checks are passing for every service.

---

## 4. Post-Deployment Health Check Results

**Backend — Detailed Health Endpoint** (`GET /api/health/detailed`):

```json
{
    "status": "ok",
    "timestamp": "2026-03-13T11:29:23.278Z",
    "uptime": "1208s",
    "mongodb": {
        "status": "connected",
        "host": "mongo",
        "name": "books"
    },
    "memory": {
        "rss": "66MB",
        "heapUsed": "18MB",
        "heapTotal": "19MB"
    },
    "nodeVersion": "v20.20.1"
}
```

- Backend API: **HEALTHY**
- MongoDB connection: **connected**
- Server uptime: **1208 seconds**
- Memory usage: **66MB RSS / 18MB heap used**

**Frontend:** HTTP `200 OK` — Nginx serving React app correctly.

**MongoDB:** Ping response `ok: 1` — database is live and accepting queries.

---

## 5. Resource Usage (Post-Deployment)

**Command run:** `docker stats --no-stream`

```
NAME            CPU %     MEM USAGE / LIMIT     NET I/O           BLOCK I/O
book-backend    0.23%     25.26MiB / 3.827GiB   101kB / 35.7kB    0B / 0B
book-frontend   0.00%     7.742MiB / 3.827GiB   76.7kB / 84.4kB   0B / 0B
book-mongo      12.25%    131.8MiB / 3.827GiB   669kB / 1.55MB    733kB / 51.2MB
```

All containers are running well within available memory. No CPU or memory issues detected.

---

## 6. Summary

| Check | Result |
|---|---|
| Integration tests (18 tests) | All passed |
| Backend Docker image build | Success — 163MB |
| Frontend Docker image build | Success — 62.1MB |
| MongoDB container health | Healthy |
| Backend container health | Healthy |
| Frontend container health | Healthy |
| Backend API (`/api/health`) | `{ "status": "ok" }` |
| MongoDB connection | Connected |
| Frontend HTTP response | 200 OK |
| Backend memory usage | 25MB (well within limits) |
| Frontend memory usage | 7.7MB (well within limits) |
| Errors in logs | None |
