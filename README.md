# Multi-Tenant User Management System

A backend system supporting multiple isolated tenants (masters), each with their own MongoDB database, built with Node.js, Express, MongoDB, and Redis.

---

## Architecture Overview

```
SuperAdmin DB (shared)
  └── SuperAdmin collection
  └── Master collection (stores tenantId per master)

Tenant DB: tenant_<tenantId>   ← one per master, created on first login
  └── MasterUser collection
  └── Data collection

Public DB: tenant_public        ← shared space for public signup users
  └── Data collection

Redis
  └── masters_list              (60s TTL, invalidated on master create)
  └── users_list_<tenantId>     (60s TTL, invalidated on user create)
```

### Key Design Decisions
- Each master gets a **unique `tenantId`** (UUID-based) at creation time
- Tenant DB connections are **created dynamically** on first use and cached in memory
- **Role is embedded in JWT** (`superadmin` | `master` | `masteruser` | `user`) so cross-login is impossible at the middleware level
- Master-users must supply their `tenantId` at login — they are completely isolated from public users

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB Atlas (or local MongoDB)
- Redis (optional — app degrades gracefully without it)

### 1. Clone & Install
```bash
git clone <repo-url>
cd multi-tenant-user-management
npm install
```

### 2. Configure Environment
Copy `.env` and fill in your values:
```bash
cp .env .env.local
```

```env
PORT=8000
JWT_SECRET_KEY=your_strong_jwt_secret_change_this_in_production

# SuperAdmin DB — full URI with DB name
MONGO_URI_SUPERADMIN=mongodb+srv://<user>:<pass>@<cluster>/SuperAdmin

# Base URI without DB name — tenant DBs are created as tenant_<tenantId>
MONGO_URI_BASE=mongodb+srv://<user>:<pass>@<cluster>

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 3. Seed SuperAdmin
There is no public route to create a SuperAdmin (by design). Run this one-time script:
```bash
node seed.js
```
Or insert directly into MongoDB:
```js
// In MongoDB shell
use SuperAdmin
db.superadmins.insertOne({
  name: "Super Admin",
  email: "admin@example.com",
  password: "<bcrypt hash of your password>"
})
```

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## API Reference

### Superadmin APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/superadmin/login` | None | SuperAdmin login |
| POST | `/superadmin/master` | SuperAdmin JWT | Create a new master |
| GET | `/superadmin/masters` | SuperAdmin JWT | List all masters (cached) |

**POST /superadmin/login**
```json
{ "email": "admin@example.com", "password": "secret" }
```

**POST /superadmin/master**
```json
{ "name": "Master One", "email": "master1@example.com", "password": "secret" }
```
Response includes `tenantId` — share this with the master for their users' login.

---

### Master APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/master/login` | None | Master login |
| POST | `/master/user` | Master JWT | Create a user in master's tenant DB |
| GET | `/master/users` | Master JWT | List users in master's tenant DB (cached) |

**POST /master/login**
```json
{ "email": "master1@example.com", "password": "secret" }
```

---

### Public User APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | None | Public user registration |
| POST | `/auth/login` | None | Public user login |
| GET | `/auth/profile` | User JWT | Get own profile |

---

### Master User APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/master/user/login` | None | Master-user login (requires `tenantId`) |
| GET | `/master/user/profile` | MasterUser JWT | Get own profile |

**POST /master/user/login**
```json
{ "email": "user@tenant.com", "password": "secret", "tenantId": "abc123..." }
```

---

### Common CRUD APIs (`/data`)

Accessible to both public users and master-users. Data is always scoped to the caller's tenant (or `public` for signup users).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/data` | User or MasterUser JWT | Create a data record |
| GET | `/data` | User or MasterUser JWT | Get all own records |
| GET | `/data/:id` | User or MasterUser JWT | Get record by ID |
| PUT | `/data/:id` | User or MasterUser JWT | Update record |
| DELETE | `/data/:id` | User or MasterUser JWT | Delete record |

**POST /data**
```json
{ "title": "My Note", "content": "Some content here" }
```

---

## MongoDB Schema Design

### SuperAdmin DB

**superadmins**
```
{ name, email, password (bcrypt), timestamps }
```

**masters**
```
{ name, email, password (bcrypt), tenantId (unique UUID), timestamps }
```

**users** (public signup users)
```
{ name, email, password (bcrypt), timestamps }
```

### Tenant DB (`tenant_<tenantId>`)

**masterusers**
```
{ name, email, password (bcrypt), masterId, timestamps }
```

**data**
```
{ title, content, userId, timestamps }
```

---

## Cross-Login Prevention

| User Type | JWT Role | Can access |
|-----------|----------|------------|
| SuperAdmin | `superadmin` | `/superadmin/*` protected routes |
| Master | `master` | `/master/user` (create), `/master/users` (list) |
| Public User | `user` | `/auth/profile`, `/data/*` |
| Master User | `masteruser` | `/master/user/profile`, `/data/*` |

Attempting to use a Master JWT on `/auth/profile` returns `403 Access denied: insufficient role`.

---

## Project Structure

```
├── config/
│   ├── superAdminDb.js     # SuperAdmin DB connection
│   ├── tenantDb.js         # Dynamic per-tenant connection manager
│   └── redis.js            # Redis client with graceful fallback
├── controllers/
│   ├── superAdminController.js
│   ├── masterController.js
│   ├── authController.js
│   ├── masterUserController.js
│   └── dataController.js
├── middleware/
│   └── authMiddleware.js   # JWT verify + requireRole() factory
├── models/
│   ├── SuperAdmin.js       # Static model (default connection)
│   ├── Master.js           # Static model (default connection)
│   ├── User.js             # Static model (default connection)
│   ├── MasterUser.js       # Factory model (tenant connection)
│   └── Data.js             # Factory model (tenant connection)
├── routes/
│   ├── superAdminRoutes.js
│   ├── masterRoutes.js
│   ├── authRoutes.js
│   ├── masterUserRoutes.js
│   └── dataRoutes.js
├── .env
├── index.js
├── package.json
└── README.md
```
