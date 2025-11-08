# EHRConnect Startup Guide

## Quick Start (TL;DR)

```bash
# Check what's running
./check-services.sh

# Start everything
brew services start postgresql
brew services start redis
cd ehr-api && npm run dev    # Terminal 1
cd ehr-web && npm run dev     # Terminal 2
```

Then visit: http://localhost:3000

## Detailed Setup

### Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed
- ✅ Redis installed
- ✅ npm packages installed (`npm install` in both folders)

### Step 1: Check Services Status

Run the service checker:

```bash
./check-services.sh
```

This will tell you exactly what's running and what needs to be started.

### Step 2: Start PostgreSQL

**macOS (Homebrew):**
```bash
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
```

**Docker:**
```bash
docker run -d --name postgres \
  -e POSTGRES_USER=medplum \
  -e POSTGRES_PASSWORD=medplum123 \
  -e POSTGRES_DB=medplum \
  -p 5432:5432 \
  postgres:15-alpine
```

**Verify:**
```bash
psql -U medplum -d medplum -c "SELECT 1;"
```

### Step 3: Start Redis

**macOS (Homebrew):**
```bash
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start redis-server
```

**Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 4: Configure Environment Variables

#### Backend (.env)

Create `ehr-api/.env` if it doesn't exist:

```bash
cd ehr-api
cp .env.example .env  # If .env.example exists
```

Ensure it contains:

```bash
# Database
DATABASE_URL=postgresql://medplum:medplum123@localhost:5432/medplum

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=8000
NODE_ENV=development

# Authentication (choose one)
AUTH_PROVIDER=postgres  # or 'keycloak'

# NextAuth (if using Keycloak)
# KEYCLOAK_URL=...
# KEYCLOAK_REALM=...
# KEYCLOAK_CLIENT_ID=...
# KEYCLOAK_CLIENT_SECRET=...
```

#### Frontend (.env.local)

Create `ehr-web/.env.local` if it doesn't exist:

```bash
cd ehr-web
cp .env.example .env.local  # If .env.example exists
```

Ensure it contains:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# Authentication Provider
AUTH_PROVIDER=postgres  # or 'keycloak'

# Keycloak (if using)
# NEXT_PUBLIC_KEYCLOAK_URL=...
# NEXT_PUBLIC_KEYCLOAK_REALM=...
# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=...
# KEYCLOAK_CLIENT_SECRET=...
```

### Step 5: Run Database Migrations

```bash
cd ehr-api
npm run migrate
```

If you need to seed data:

```bash
npm run seed
```

### Step 6: Start Backend Server

Open a new terminal:

```bash
cd ehr-api
npm run dev
```

You should see:

```
✅ Redis connected successfully
✅ Connected to PostgreSQL database
🚀 Server running on port 8000
```

**Test the backend:**

```bash
# Health check
curl http://localhost:8000/health

# FHIR metadata
curl http://localhost:8000/fhir/R4/metadata
```

### Step 7: Start Frontend Server

Open another new terminal:

```bash
cd ehr-web
npm run dev
```

You should see:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 8: Access the Application

Open your browser and go to:

**http://localhost:3000**

## Common Issues & Solutions

### Issue 1: 500 Error - "fetch failed"

**Symptom:** Frontend shows 500 error when loading data

**Cause:** Backend is not running

**Solution:**
```bash
cd ehr-api
npm run dev
```

### Issue 2: 431 Request Header Fields Too Large

**Symptom:** Error after login, site becomes unusable

**Solution:**
1. Clear browser cookies (DevTools → Application → Cookies)
2. Ensure Redis is running: `redis-cli ping`
3. Restart backend: `cd ehr-api && npm run dev`
4. Login again

### Issue 3: Database Connection Error

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U medplum -d medplum -c "SELECT 1;"

# If not, start it
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

### Issue 4: Redis Connection Error

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
brew services start redis  # macOS
sudo systemctl start redis-server  # Linux
docker start redis  # Docker
```

### Issue 5: Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using the port
lsof -ti:3000  # or :8000 for backend

# Kill the process
kill -9 $(lsof -ti:3000)

# Or for backend
kill -9 $(lsof -ti:8000)
```

### Issue 6: Module Not Found

**Symptom:** `Cannot find module 'redis'` or similar

**Solution:**
```bash
# Reinstall dependencies
cd ehr-api
rm -rf node_modules
npm install

# For frontend
cd ehr-web
rm -rf node_modules
npm install
```

## Service Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│           http://localhost:3000                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)          │
│                                                 │
│  - Public Pages (Landing, Widget)               │
│  - Authenticated Pages (Dashboard, etc.)        │
│  - API Routes (/api/*)                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Express Backend (Port 8000)            │
│                                                 │
│  - FHIR R4 API (/fhir/R4/*)                    │
│  - Auth API (/api/auth/*)                      │
│  - User Data API (/api/user/*)                 │
│  - Public API (/api/public/*)                  │
└─────────┬────────────────────┬──────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │      Redis       │
│   (Port 5432)    │  │   (Port 6379)    │
│                  │  │                  │
│  - FHIR Data     │  │  - User Cache    │
│  - User Data     │  │  - Sessions      │
│  - Org Data      │  │  - Temp Data     │
└──────────────────┘  └──────────────────┘
```

## Development Workflow

### 1. Daily Startup

```bash
# Check status
./check-services.sh

# Start backend (Terminal 1)
cd ehr-api && npm run dev

# Start frontend (Terminal 2)
cd ehr-web && npm run dev
```

### 2. Making Changes

**Backend Changes:**
- Server auto-restarts on file changes
- Database changes require migration: `npm run migrate`

**Frontend Changes:**
- Hot reload on file changes
- No restart needed

### 3. Testing APIs

```bash
# Test backend directly
curl http://localhost:8000/api/auth/health

# Test through frontend proxy
curl http://localhost:3000/api/fhir/Organization?_count=1
```

### 4. Database Management

```bash
# Connect to database
psql -U medplum -d medplum

# Run migrations
cd ehr-api && npm run migrate

# Seed data
npm run seed

# Reset database (careful!)
npm run db:reset
```

### 5. Cache Management

```bash
# Check Redis
redis-cli KEYS "*"

# Clear cache
redis-cli FLUSHALL

# Or via API
curl -X POST http://localhost:8000/api/user/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}'
```

## Stopping Services

### Temporary Stop (Ctrl+C in terminals)

Just press `Ctrl+C` in the terminal running the service.

### Stop All Services

```bash
# Stop backend
kill -9 $(lsof -ti:8000)

# Stop frontend
kill -9 $(lsof -ti:3000)

# Stop PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux

# Stop Redis
brew services stop redis  # macOS
sudo systemctl stop redis-server  # Linux
```

## Environment-Specific Setup

### Development
- Use `npm run dev` for both frontend and backend
- Enable debug mode: `NEXTAUTH_DEBUG=true`
- Hot reload enabled

### Production
- Build frontend: `cd ehr-web && npm run build`
- Start frontend: `cd ehr-web && npm start`
- Use PM2 for backend: `pm2 start ehr-api/src/index.js`
- Configure Nginx reverse proxy
- Use managed PostgreSQL and Redis services

## Useful Commands

```bash
# Check all services
./check-services.sh

# View backend logs
cd ehr-api && tail -f logs/app.log

# View frontend logs
cd ehr-web && npm run dev | tee frontend.log

# Database backup
pg_dump -U medplum medplum > backup.sql

# Database restore
psql -U medplum medplum < backup.sql

# Clear all caches
redis-cli FLUSHALL

# Check Node.js version
node --version

# Check npm version
npm --version

# Update dependencies
cd ehr-api && npm update
cd ehr-web && npm update
```

## Getting Help

1. **Run service checker:** `./check-services.sh`
2. **Check logs:** Look for error messages in terminal
3. **Verify environment:** Check `.env` files
4. **Test individual services:** Use `curl` to test endpoints
5. **Clear cache/cookies:** Often solves weird issues

## Next Steps

Once everything is running:

1. ✅ Access frontend: http://localhost:3000
2. ✅ Create an account or login
3. ✅ Complete onboarding
4. ✅ Explore the dashboard
5. ✅ Test the booking widget: http://localhost:3000/widget/booking?org=your-org-slug

Happy coding! 🚀
