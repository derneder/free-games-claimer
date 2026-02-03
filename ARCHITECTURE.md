# 🏗️ System Architecture

**Project:** Free Games Claimer  
**Status:** Production Ready  
**Version:** 1.0.0  

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  React SPA (Dashboard, Admin Panel, Authentication UI)       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/WSS
                         │
┌────────────────────────┴────────────────────────────────────┐
│              REVERSE PROXY LAYER (Nginx)                     │
│  SSL/TLS Termination | Rate Limiting | Load Balancing       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP
                         │
┌────────────────────────┴────────────────────────────────────┐
│            APPLICATION LAYER (Express.js)                    │
│  Routes | Controllers | Middleware | Business Logic         │
└────────┬───────────────┬───────────────┬────────────────────┘
         │               │               │
    ┌────▼────┐   ┌─────▼─────┐   ┌────▼─────┐
    │ Database │   │   Cache   │   │ Services │
    │PostgreSQL│   │  Redis    │   │ (External)│
    └─────────┘   └───────────┘   └──────────┘
         │               │               │
    ┌────▼───────────────▼───────────────▼─────┐
    │        PERSISTENCE & STATE LAYER         │
    │  Postgres | Redis | Message Queue (opt)  │
    └──────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Authentication Flow
```
Client          API Server       Database       Cache
  │                │                │            │
  │─Register───────>│                │            │
  │                 │──Validate────>│            │
  │                 │<──User Created─│            │
  │                 │──JWT Token────>│            │
  │<─Token+User─────│                │            │
  │                 │                │            │
  │─Login───────────>│                │            │
  │                 │──Query────────>│            │
  │                 │<──User Data────│            │
  │                 │──Verify Pass───│            │
  │                 │──Generate JWT──│            │
  │                 │──Cache Session─────────────>│
  │<─Token+User─────│                │            │
```

### Game CRUD Flow
```
Client          API Server       Database       Cache       Logs
  │                │                │            │            │
  │─Create Game──-->│                │            │            │
  │                 │──Validate────>│            │            │
  │                 │<──Game ID─────│            │            │
  │                 │──Invalidate───────────────>│            │
  │                 │──Log Action──────────────────────────────>│
  │<─Game Data─────│                │            │            │
  │                 │                │            │            │
  │─Get Games───────>│                │            │            │
  │                 │──Check Cache──────────────>│            │
  │                 │<──Cache Hit────────────────│            │
  │<─Games List─────│                │            │            │
```

---

## 🗄️ Database Architecture

### Schema Design
```
Users Table
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── username (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── role (ENUM: user, admin)
├── twofa_enabled (BOOLEAN)
├── twofa_secret (VARCHAR)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Games Table
├── id (UUID, PK)
├── user_id (UUID, FK -> Users)
├── title (VARCHAR)
├── description (TEXT)
├── price (DECIMAL)
├── image_url (VARCHAR)
├── platforms (JSON)
├── sources (JSON)
├── game_url (VARCHAR)
├── claimed_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Activity Logs Table
├── id (UUID, PK)
├── user_id (UUID, FK -> Users)
├── action (VARCHAR)
├── description (TEXT)
├── resource_type (VARCHAR)
├── resource_id (UUID)
├── ip_address (INET)
├── user_agent (TEXT)
└── created_at (TIMESTAMP)

Refresh Tokens Table
├── id (UUID, PK)
├── user_id (UUID, FK -> Users)
├── token (VARCHAR, UNIQUE)
├── expires_at (TIMESTAMP)
├── revoked_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### Indexing Strategy
```
Users Table
├── INDEX idx_email ON email (for login queries)
├── INDEX idx_username ON username (for profile lookup)
├── INDEX idx_is_active ON is_active (for admin queries)
└── INDEX idx_created_at ON created_at (for date filtering)

Games Table
├── INDEX idx_user_id ON user_id (for user queries)
├── INDEX idx_claimed_at ON claimed_at (for sorting)
├── INDEX idx_expires_at ON expires_at (for expiration)
└── COMPOSITE INDEX idx_user_claimed ON (user_id, claimed_at)

Activity Logs Table
├── INDEX idx_user_id ON user_id (for audit trail)
├── INDEX idx_action ON action (for filtering)
├── INDEX idx_created_at ON created_at (for date range)
└── COMPOSITE INDEX idx_user_action ON (user_id, action)
```

---

## 🔐 Security Architecture

### Authentication & Authorization
```
Login Request
    ↓
Validate Credentials
    ↓
Generate JWT Token
    ├─ Header: typ, alg
    ├─ Payload: user_id, role, exp
    └─ Signature: HS256(secret)
    ↓
Store in HTTP-Only Cookie
    ↓
Send Refresh Token (DB)
```

### Token Structure
```
Access Token
├─ Expires: 24 hours
├─ Contains: User ID, Role
├─ Used for: API requests
└─ Storage: Memory (secure)

Refresh Token
├─ Expires: 7 days
├─ Contains: Token ID
├─ Used for: Token renewal
└─ Storage: Database + HTTP-Only Cookie
```

### Password Security
```
Password Input
    ↓
Validate Requirements
├─ Minimum 8 characters
├─ Uppercase letter
├─ Lowercase letter
├─ Number
└─ Special character
    ↓
Hash with bcrypt (rounds: 10)
    ↓
Store in database
```

### API Security
```
Request Headers
├─ Authorization: Bearer <JWT>
├─ X-CSRF-Token: <token>
├─ Content-Type: application/json
└─ User-Agent: <client>
    ↓
Validate JWT
    ├─ Signature verification
    ├─ Expiration check
    └─ User existence check
    ↓
Check Authorization
    ├─ User role
    └─ Resource ownership
    ↓
Validate Input
    ├─ Schema validation
    ├─ SQL injection prevention
    └─ XSS prevention
```

---

## 💾 Caching Strategy

### Redis Usage
```
Session Cache
├─ Key: session:{userId}
├─ Value: User session data
└─ TTL: 24 hours

User Cache
├─ Key: user:{userId}
├─ Value: User profile data
└─ TTL: 1 hour

Games Cache
├─ Key: games:{userId}:{page}
├─ Value: Games list
└─ TTL: 30 minutes

Admin Stats Cache
├─ Key: admin:stats
├─ Value: System statistics
└─ TTL: 5 minutes
```

### Cache Invalidation
```
On User Update
    └─ DELETE user:{userId}

On Game Create/Update/Delete
    ├─ DELETE games:{userId}:*
    ├─ DELETE admin:stats
    └─ Increment version

On Login/Logout
    ├─ SET session:{userId}
    └─ DELETE user:{userId}
```

---

## 📈 Performance Architecture

### Request Processing
```
1. Nginx Reverse Proxy
   ├─ SSL/TLS termination
   ├─ Gzip compression
   ├─ Static asset caching
   └─ Rate limiting

2. Express.js Server
   ├─ JWT authentication
   ├─ Input validation
   ├─ Business logic
   └─ Database queries

3. Database Layer
   ├─ Connection pooling
   ├─ Query optimization
   ├─ Index usage
   └─ Result caching

4. Cache Layer
   ├─ Session storage
   ├─ Query results
   ├─ User profiles
   └─ Statistics
```

### Optimization Techniques
```
✓ Database
  ├─ Prepared statements
  ├─ Batch operations
  ├─ Lazy loading
  ├─ Query optimization
  └─ Regular VACUUM

✓ API
  ├─ Pagination
  ├─ Field filtering
  ├─ Compression
  ├─ Caching headers
  └─ Rate limiting

✓ Frontend
  ├─ Code splitting
  ├─ Lazy loading
  ├─ Image optimization
  ├─ Bundle minification
  └─ Service workers
```

---

## 🚀 Deployment Architecture

### Development Environment
```
Docker Compose (docker-compose.yml)
├─ PostgreSQL 15 (Port 5432)
├─ Redis 7 (Port 6379)
├─ Backend API (Port 3000)
└─ Frontend (Port 5173)

Features
├─ Hot reload
├─ Volume mounts
├─ Network isolation
└─ Health checks
```

### Production Environment
```
Docker Compose (docker-compose.prod.yml)
├─ PostgreSQL 15
│  ├─ Persistent volumes
│  ├─ Backup strategy
│  └─ Replication (optional)
├─ Redis 7
│  ├─ Persistent storage
│  └─ AOF enabled
├─ Backend API
│  ├─ Multi-container (optional)
│  ├─ Health checks
│  └─ Auto-restart
├─ Frontend
│  ├─ Static files
│  ├─ Gzip compression
│  └─ Cache headers
└─ Nginx Reverse Proxy
   ├─ SSL/TLS
   ├─ Load balancing
   └─ Rate limiting
```

---

## 📊 Scalability Architecture

### Horizontal Scaling
```
Load Balancer
    ├─ Backend API Instance 1
    ├─ Backend API Instance 2
    ├─ Backend API Instance 3
    └─ Backend API Instance N
         ↓
    Shared PostgreSQL
    Shared Redis
```

### Vertical Scaling
```
Increase Resources
├─ CPU cores
├─ Memory (RAM)
├─ Storage space
└─ Network bandwidth

Optimizations
├─ Connection pooling
├─ Query optimization
├─ Cache improvement
└─ CDN usage
```

---

## 📝 Monitoring & Logging

### Application Logging
```
Log Levels
├─ ERROR: Critical errors
├─ WARN: Warnings
├─ INFO: General information
└─ DEBUG: Detailed debugging

Log Destinations
├─ Console (development)
├─ File system (production)
├─ Centralized logging (optional)
└─ Error tracking (optional)
```

### Metrics Collection
```
Application Metrics
├─ Request count
├─ Response time
├─ Error rate
├─ Database queries
└─ Cache hit rate

System Metrics
├─ CPU usage
├─ Memory usage
├─ Disk I/O
├─ Network I/O
└─ Container health
```

---

## 🎯 API Design

### RESTful Principles
```
Resources
├─ /api/auth          (Authentication)
├─ /api/games         (Games)
├─ /api/users         (Users)
└─ /api/admin         (Administration)

HTTP Methods
├─ GET    (Retrieve)
├─ POST   (Create)
├─ PUT    (Update)
└─ DELETE (Remove)

Status Codes
├─ 200: OK
├─ 201: Created
├─ 400: Bad Request
├─ 401: Unauthorized
├─ 403: Forbidden
├─ 404: Not Found
└─ 500: Server Error
```

---

## 🔄 CI/CD Pipeline Architecture

```
Git Push
    ↓
GitHub Actions Trigger
    ├─ CI Pipeline
    │  ├─ Run tests
    │  ├─ Lint code
    │  ├─ Security scan
    │  └─ Build images
    ├─ Security Pipeline
    │  ├─ Dependency scan
    │  ├─ CodeQL analysis
    │  └─ SAST scan
    └─ Deploy Pipeline (main branch)
       ├─ Build Docker images
       ├─ Run tests
       ├─ Deploy to production
       └─ Health check
```

---

## 📋 Technology Stack Summary

**Frontend**
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Zustand

**Backend**
- Node.js 18
- Express.js
- PostgreSQL 15
- Redis 7
- JWT
- bcrypt

**DevOps**
- Docker & Docker Compose
- Nginx
- GitHub Actions
- Let's Encrypt SSL

**Testing**
- Jest
- Supertest
- Mock libraries

---

## ✅ Production Checklist

- [x] Database configured
- [x] Environment variables set
- [x] SSL certificates obtained
- [x] Backups configured
- [x] Monitoring enabled
- [x] Rate limiting active
- [x] Security headers set
- [x] CORS configured
- [x] Logging enabled
- [x] Error tracking ready

---

**Status:** Ready for Production ✅
