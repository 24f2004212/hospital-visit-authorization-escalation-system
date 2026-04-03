#🧠 High-level architecture
[ Client (Browser / Mobile) ]
            ↓
[ Next.js (Frontend) ]
            ↓ (HTTP / WebSocket)
[ NestJS (Backend API + Services) ]
            ↓
[ Supabase Postgres (Database) ]

👉 Separation is key:

Next.js → UI only
NestJS → all business logic
Supabase Postgres → data
🧩 Layered breakdown
##Frontend — Next.js

Role: UI + user interaction

Handles:

Student dashboard
Warden panel
Forms (outpass requests)
Status tracking

Communicates with:

NestJS via REST APIs / WebSockets

Typical structure:

/app
  /dashboard
  /request
  /login
/components
/services (API calls)
#2️⃣ Backend — NestJS (core of system)

Role: brain of your application

Key modules:
/modules
  /auth
  /users
  /requests
  /approvals
  /tracking
  /notifications
Responsibilities
🔐 Auth Module
JWT authentication
Role-based access (RBAC)

Roles:

Student
Warden
Security
📋 Request Module
Create request
Update status
Track lifecycle

Status example:

PENDING → APPROVED → REJECTED → EXITED → RETURNED
#🔄 Workflow Logic (VERY IMPORTANT)

This is your core:

Student submits →
Warden approves →
Security verifies →
Exit logged →
Return logged

👉 This must live in services, not controllers

⚡ Real-time Module (WebSockets)

Use NestJS Gateway:

Live status updates
Notifications
Alerts (delays/escalations)
🔔 Notification Module
Email / SMS / push
Parent alerts (optional)
📊 Audit / Logs

Store:

who approved
timestamps
changes

👉 Makes your system “professional”

#🗄️ Database — Supabase Postgres
Core tables
users
requests
approvals
roles
logs
Example relationships
User → Requests (1:N)
Request → Approval (1:N)
Request → Logs (1:N)
Example schema idea
User
- id
- name
- role

Request
- id
- student_id
- status
- created_at

Approval
- id
- request_id
- approved_by
- role

Log
- id
- request_id
- action
- timestamp
#🔗 Communication flow
Normal API flow
Frontend (Next.js)
    ↓
HTTP request
    ↓
NestJS Controller
    ↓
Service (business logic)
    ↓
Database (Supabase Postgres)
Real-time flow
NestJS Gateway (WebSocket)
        ↑ ↓
Frontend (live updates)
🚀 Deployment architecture
[ Next.js ] → Vercel / Netlify
[ NestJS ] → AWS / Railway / Render
[ Supabase Postgres ] → Supabase
🔐 Security layer (don’t skip)
JWT + refresh tokens
Role guards (NestJS)
Input validation (DTOs)
Rate limiting

## Supabase Setup

1. Create a Supabase project.
2. Open `Project Settings -> Database` and copy the connection string.
3. Put the pooled connection string into `backend/.env` as `DATABASE_URL`.
4. Optionally keep the direct connection string in `backend/.env.example` as `DIRECT_URL` for Prisma schema pushes and migrations.
5. Run `npm run db:push` to sync the Prisma schema to Supabase.
