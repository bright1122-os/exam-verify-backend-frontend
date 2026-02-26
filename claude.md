# ExamVerify — Project State Document (claude.md)

> This file is the operational source of truth for this project. It must be read at the start of every session and updated after every meaningful code change, dependency change, schema change, or architecture change.

---

## Project Title

**ExamVerify — University Exam Entry Verification System**

---

## Description

A secure, full-stack web application enabling Nigerian universities to digitally verify students' eligibility to sit for examinations. It replaces paper-based exam clearance with an encrypted, QR-code-based system that is time-limited and verifiable in real time.

---

## System Purpose

Three user roles interact with dedicated portals:

| Role | Purpose |
|------|---------|
| **Student** | Register academic profile → upload passport photo → initiate exam fee payment → receive encrypted QR exam pass |
| **Examiner** | Scan student QR code → verify clearance status → approve or deny exam hall entry |
| **Admin** | Manage students, payments, verifications; manual status overrides |

---

## Tech Stack

### Frontend (`exam-verify-system/`)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 (Anthropic-inspired design system) |
| State management | Zustand 5 |
| Routing | React Router v7 |
| HTTP client | Axios (for `/api/verify-payment` Vercel function only) |
| Auth | **Supabase Auth** (email/password + Google OAuth) |
| Database | **Supabase PostgreSQL** (students, payments, verifications, profiles tables) |
| File storage | **Supabase Storage** (`photos` bucket) |
| QR generation | `qrcode.react` (SVG display) + `crypto-js` AES-256 (payload encryption) |
| QR scanning | `jsqr` (camera frame decoding) + `crypto-js` AES-256 (payload decryption) |
| Realtime | `socket.io-client` (connected to Express server — not yet fully wired) |
| Animations | Framer Motion 12 |
| Forms | React Hook Form 7 |
| Toasts | react-hot-toast |

### Active Backend — Vercel Serverless Function (`exam-verify-system/api/`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Entry point | `api/verify-payment.js` |
| Purpose | Remita payment verification + Supabase record update |
| Auth method | Supabase service role key |
| Payment API | Remita demo API (`https://remitademo.net/payment/v1/payment/status/:rrr`) |

### Express Backend — Deployed but Not Used by Frontend (`exam-verify-system/server/`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT + Google OAuth (Passport) |
| QR | JWT-signed tokens (backend-generated) |
| Realtime | Socket.io |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Validation | *(Not present in server/ — present in exam-verify-backend/)* |
| Entry point | `server/src/app.js` |

> **CRITICAL NOTE:** The Express server (`server/`) is deployed to Vercel via `vercel.json` rewrites, but the **frontend does not call any of its endpoints**. The frontend exclusively uses Supabase for all data operations. The Express server and its MongoDB models are dormant/unused in the current live frontend flow. The active payment verification backend is `api/verify-payment.js`.

### Standalone Backend (`exam-verify-backend/`)
- Complete, independent Node.js/Express + MongoDB backend with full MVC structure
- Has its own `package.json`, not referenced by `vercel.json`
- Contains full services layer (Remita, Cloudinary, QR), utils (crypto, logger), and config
- **Status: Separate deployment (e.g., Render). Not active for the Vercel frontend deployment.**

---

## Architecture Overview

```
bright1122-os/ (profile repo, branch: claude/project-handoff-setup-v6pY4)
│
├── exam-verify-system/              ← ACTIVE: Vercel-deployed full-stack app
│   ├── src/                         ← React frontend
│   │   ├── components/
│   │   │   ├── auth/                ← GoogleLoginButton
│   │   │   ├── layout/              ← Navbar, Footer, PageTransition
│   │   │   └── ui/                  ← Badge, Button, Card, Input, LoadingSpinner, Modal
│   │   ├── lib/
│   │   │   └── supabase.js          ← Supabase client (reads VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
│   │   ├── pages/
│   │   │   ├── auth/                ← Login, Register auth pages
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx    ← Reads students + payments from Supabase
│   │   │   │   ├── Register.jsx     ← Inserts to students, initiates payment, calls /api/verify-payment
│   │   │   │   ├── PrintQR.jsx      ← Generates AES-256 encrypted QR via crypto-js
│   │   │   │   └── VerificationStatus.jsx
│   │   │   ├── examiner/
│   │   │   │   ├── Dashboard.jsx    ← Examiner stats from Supabase
│   │   │   │   └── ScanPortal.jsx   ← jsqr scan + AES-256 decrypt + Supabase verify/record
│   │   │   └── admin/
│   │   │       └── Dashboard.jsx    ← Admin stats from Supabase
│   │   ├── services/
│   │   │   └── api.js               ← Axios instance (for Express /api/v1/* — currently unused by active flows)
│   │   ├── store/
│   │   │   └── useStore.js          ← Zustand store: Supabase auth + profile management
│   │   └── utils/
│   │       ├── crypto.js            ← CryptoJS AES-256 encrypt/decrypt for QR payloads ← ACTIVE
│   │       ├── qrcode.js            ← btoa/atob base64 encoding ← DEAD CODE (not imported anywhere)
│   │       ├── mockImages.js        ← Avatar generation utility
│   │       └── validators.js        ← Form validators
│   │
│   ├── api/
│   │   └── verify-payment.js        ← ACTIVE Vercel serverless function: Remita + Supabase update
│   │
│   ├── server/src/                  ← Express+MongoDB backend (deployed to Vercel, NOT used by frontend)
│   │   ├── app.js                   ← Express app entry
│   │   ├── controllers/             ← auth, student, payment, qr, examiner, admin
│   │   ├── middleware/              ← auth guards
│   │   ├── models/                  ← User, Student, Payment, Verification (Mongoose)
│   │   ├── routes/                  ← Express routes
│   │   └── socket/                  ← Socket.io handlers
│   │
│   ├── supabase/
│   │   └── functions/               ← (empty or edge function placeholders)
│   │
│   ├── vercel.json                  ← Deployment config. SECURITY: env block must NOT contain secrets
│   ├── EXAMVERIFY_DOCUMENTATION.md  ← Full project spec
│   └── package.json
│
├── exam-verify-backend/             ← Standalone backend (separate deployment, e.g., Render)
│   └── src/                         ← Full MVC: config, controllers, middleware, models, routes, services, socket, utils
│
├── agent.md                         ← Agent operating manual
├── claude.md                        ← This file
└── tasks/
    ├── todo.md                      ← Active work tracker
    └── lessons.md                   ← Lessons learned
```

---

## Implementation History

### Phase 1 — Project Initialization (2026-02-24, Session 1)
- Initial repo scaffolding created with React/Vite frontend and dual backend structure
- `exam-verify-system/` set up as combined frontend + embedded Express backend for Vercel deployment
- `exam-verify-backend/` created as standalone full-MVC backend for separate hosting (e.g., Render)
- Frontend implemented using Supabase for ALL data operations (auth, students, payments, verifications)
- Express backend (`server/`) added to Vercel deployment but frontend uses Supabase directly instead
- Two backend paradigms coexist: Supabase (active for frontend) and MongoDB/JWT (available via Express, unused by frontend)
- Anthropic-inspired design system implemented: Parchment (#FAF9F5), Anthracite (#141413), Terracotta (#D97757), Sage (#788C5D), Sky (#6A9BCC); Poppins headings + Lora body

### Phase 2 — Operational Files + Bug Fixes (2026-02-24, Session 2)
- Created `agent.md`, `tasks/todo.md`, `tasks/lessons.md` (were missing from repo)
- Created this file (`claude.md`)
- Validated all 7 reported bugs against actual code (see Bug Audit section)
- Fixed real bugs: Register.jsx missing useEffect import, updateStudentData missing from useStore, ScanPortal QR replay vulnerability, vercel.json hardcoded secrets, app.js ESM import order
- Documented architecture reality: frontend is Supabase-based, Express server/MongoDB is secondary
- Documented dead code: `src/utils/qrcode.js` (btoa encoding) is not imported by any active flow
- Documented active QR strategy: AES-256 (CryptoJS) on frontend, NOT JWT backend

---

## Bug Audit (Session 2 — 2026-02-24)

| Bug | Reported Description | Verdict | Real Issue | Fix Applied |
|-----|---------------------|---------|------------|-------------|
| Bug 1 | studentData ReferenceError in Dashboard.jsx | **MISDIAGNOSED** | Dashboard correctly uses `const { data: studentData }` from Supabase. Real bug: `Register.jsx` uses `useEffect` without importing it, and calls `updateStudentData()` which doesn't exist in `useStore.js` | Fixed: added `useEffect` import to Register.jsx; added `updateStudentData` action to useStore.js |
| Bug 2 | snake_case vs camelCase mismatch in Dashboard | **MISDIAGNOSED** | Dashboard uses Supabase (PostgreSQL), where snake_case is correct. No bug. | No action needed |
| Bug 3 | initializeAuth API response unwrapping | **MISDIAGNOSED** | `useStore.js` uses Supabase Auth SDK, not axios. No response unwrapping issue. | No action needed |
| Bug 4 | signIn/signUp vs initializeAuth response inconsistency | **MISDIAGNOSED** | All auth uses Supabase SDK consistently. No inconsistency. | No action needed |
| Bug 5 | QR incompatibility (AES frontend vs JWT backend) | **PARTIALLY VALID** | Frontend QR flow is self-consistent (AES encrypt in PrintQR → AES decrypt in ScanPortal). Real bug: `handleApprove()` in ScanPortal doesn't mark `qr_used=true` in Supabase → QR is replayable. Also: `src/utils/qrcode.js` is dead code. | Fixed: ScanPortal `verifyStudent()` checks `qr_used`; `handleApprove()` marks `qr_used=true` |
| Bug 6 | Replay logic in server/src/controllers/qr.js | **MISLOCATED** | Express qr.js verify IS correctly read-only; approve marks `qrCodeUsed=true`. Correct by design. Real replay bug was in ScanPortal.jsx (fixed in Bug 5). | No change to qr.js needed |
| Bug 7 | ESM imports after executable code in server/src/app.js | **VALID** | Static `import` declarations on lines 40-45 appear after middleware setup code. While ESM hoists them, this violates code standards and confuses tooling. | Fixed: moved all imports to top of file |

---

## QR Code Strategy

### Active Frontend QR Strategy (Supabase-based flow)

| Step | Who | How |
|------|-----|-----|
| Generate | PrintQR.jsx | Reads student from Supabase → builds payload `{id, matric, generatedAt, verifier:'exam-verify-system'}` → AES-256 encrypts with `VITE_QR_SECRET_KEY` → renders as `<QRCodeSVG>` |
| Scan | ScanPortal.jsx | `jsqr` reads camera frames → extracts QR string → `decryptQRData()` AES-256 decrypts |
| Verify | ScanPortal.jsx | Checks `qr_data.verifier === 'exam-verify-system'` → queries Supabase `students` → checks `registration_complete`, `payment_verified`, `qr_generated`, `qr_used` |
| Approve | ScanPortal.jsx | Inserts into `verifications` table → sets `qr_used=true` on student record |

### Dead QR Code (Not Used)
- `src/utils/qrcode.js` — btoa/atob base64 encoding. Never imported by any active page/component.

### Express Backend QR Strategy (JWT-based, dormant for frontend)
- `server/src/controllers/qr.js` — generates JWT-signed QR tokens, stores `qrCodeToken` in MongoDB
- NOT called by the frontend currently
- Functions correctly in isolation; if Express backend is used in future, its replay protection is solid

---

## Supabase Database Schema

### Table: `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | User ID (matches Supabase auth.users.id) |
| role | TEXT | 'student', 'examiner', 'admin' |
| full_name | TEXT | User's full name |

### Table: `students`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users.id |
| matric_number | TEXT | Unique matriculation number |
| faculty | TEXT | |
| department | TEXT | |
| level | TEXT | '100' through '600' |
| photo_url | TEXT | Supabase Storage URL |
| registration_complete | BOOLEAN | Set true on profile completion |
| payment_verified | BOOLEAN | Set true after Remita verification |
| qr_generated | BOOLEAN | Set true when payment verified (payment verification endpoint sets both) |
| qr_used | BOOLEAN | Set true when QR approved by examiner ← added in Bug 5 fix |
| qr_used_at | TIMESTAMPTZ | Timestamp of QR approval ← added in Session 3 migration |
| created_at | TIMESTAMP | Auto |

### Table: `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users.id |
| amount | NUMERIC | Payment amount in NGN |
| rrr | TEXT | Remita Retrieval Reference |
| status | TEXT | 'pending', 'verified', 'failed' |
| created_at | TIMESTAMP | Auto |

### Table: `verifications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| student_id | UUID | FK to students.id |
| examiner_id | UUID | FK to auth.users.id |
| status | TEXT | 'approved', 'denied' |
| exam_hall | TEXT | |
| notes | TEXT | Optional |
| denial_reason | TEXT | Required when denied |
| scanned_at | TIMESTAMP | |

---

## Environment Variables

### Frontend (`exam-verify-system/` — Vercel build env)
| Variable | Purpose | Required |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `VITE_QR_SECRET_KEY` | AES-256 key for QR payload encryption | Yes |
| `VITE_API_URL` | Base URL for Express API (currently unused by active flows) | Optional |

### Backend — Vercel Serverless (`api/verify-payment.js`)
| Variable | Purpose | Required |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin access) | Yes |
| `REMITA_SECRET_KEY` | Remita API secret key | Yes |

### Backend — Express (`server/src/`) — Set in Vercel Env if keeping server alive
| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing key (min 64 chars) |
| `QR_ENCRYPTION_KEY` | JWT signing key for QR tokens |
| `CLIENT_URL` | Allowed CORS origin |

> **SECURITY RULE:** NONE of the above variables may appear in `vercel.json`, `.env` files, or any git-tracked file. All must be set via the Vercel dashboard or `vercel env add`. The `vercel.json` `env` block must never contain secret values.

---

## API Endpoints

### Active — Vercel Serverless Function
| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| POST | `/api/verify-payment` | `api/verify-payment.js` | Verify Remita RRR, update Supabase students + payments |

### Express Routes (deployed to Vercel `/api/v1/*`, NOT called by frontend currently)
| Method | Path | Controller | Purpose |
|--------|------|-----------|---------|
| POST | `/api/v1/auth/register` | authController | Register user (MongoDB) |
| POST | `/api/v1/auth/login` | authController | Login (JWT) |
| GET | `/api/v1/auth/google` | authController | Google OAuth initiate |
| GET | `/api/v1/auth/google/callback` | authController | Google OAuth callback |
| GET | `/api/v1/auth/me` | authController | Get current user |
| POST | `/api/v1/student/register` | studentController | Create student profile |
| GET | `/api/v1/student/dashboard` | studentController | Student dashboard data |
| POST | `/api/v1/payment/initiate` | paymentController | Generate RRR via Remita |
| POST | `/api/v1/payment/verify/:rrr` | paymentController | Verify payment |
| GET | `/api/v1/qr/my-qr` | qrController | Get/generate QR code (JWT) |
| POST | `/api/v1/qr/verify` | qrController | Verify scanned QR (read-only) |
| POST | `/api/v1/examiner/approve` | examinerController | Approve entry (marks qrCodeUsed) |
| POST | `/api/v1/examiner/deny` | examinerController | Deny entry |
| GET | `/api/v1/admin/stats` | adminController | Dashboard statistics |

---

## Security Design

### Authentication
- **Active**: Supabase Auth (email/password + Google OAuth via Supabase provider)
- **Dormant**: Express JWT auth (not used by frontend in current deployment)
- Sessions managed by Supabase client with `onAuthStateChange` listener

### QR Code Security (Active Supabase flow)
- AES-256 encryption via CryptoJS
- Payload includes `verifier: 'exam-verify-system'` field for origin check
- **Single-use enforcement (post Bug 5 fix)**: `qr_used=true` set in Supabase on approval; `verifyStudent()` checks `qr_used` before proceeding
- HTTPS required (Vercel provides this automatically)

### QR Code Security (Dormant Express flow)
- JWT-signed tokens with 30-day expiry
- Random `qrCodeToken` (32-byte hex) embedded in JWT and stored in MongoDB
- Single-use: `qrCodeUsed` set to `true` by `/examiner/approve`
- `/qr/verify` is intentionally read-only (no state mutation)

### Known Security Incidents
1. **RESOLVED IN CODE — REQUIRES MANUAL ACTION**: `vercel.json` historically contained hardcoded `MONGODB_URI`, `JWT_SECRET`, and `QR_ENCRYPTION_KEY`. These were removed in Session 2. **The credentials that were exposed must be rotated manually**:
   - MongoDB: rotate the `agwunobisomtochukwu_db_user` password in MongoDB Atlas
   - JWT_SECRET: generate a new 64+ char random string
   - QR_ENCRYPTION_KEY: generate a new 32+ char random string
   - All existing JWTs signed with the old key are cryptographically invalidated once the key changes

---

## Deployment Instructions

### Vercel (Frontend + Serverless)
1. Connect `exam-verify-system/` directory to Vercel
2. Framework preset: Vite (auto-detected)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard (NEVER in vercel.json):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_QR_SECRET_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REMITA_SECRET_KEY`
   - (If using Express server) `MONGODB_URI`, `JWT_SECRET`, `QR_ENCRYPTION_KEY`, `CLIENT_URL`
6. Camera access requires HTTPS — Vercel provides this automatically

### Standalone Backend (exam-verify-backend/) — e.g., Render
1. Push to GitHub, connect to Render Web Service
2. Build command: `npm install`
3. Start command: `npm start`
4. Set all env vars from `.env.example` in Render dashboard

### Supabase Setup
1. Create project at supabase.com
2. Run SQL migrations for tables: profiles, students, payments, verifications
3. Enable Row Level Security (RLS) policies:
   - Students can only read/write their own records
   - Examiners can read all students, write to verifications
   - Admins have full access
4. Create `photos` storage bucket (public read, authenticated write)
5. Enable Google OAuth in Supabase Auth dashboard

---

## CI/CD Workflows (GitHub Actions)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Deploy Supabase Edge Functions | `.github/workflows/deploy-supabase.yml` | Push to `main` (supabase/functions/** changed) | Deploys `verify-payment` Edge Function |
| Run DB Migrations | `.github/workflows/run-migrations.yml` | Push to `main` (supabase/migrations/** changed) OR manual | Applies SQL migrations via Supabase Management API |
| Configure Vercel Env Vars | `.github/workflows/configure-vercel-env.yml` | Manual (`workflow_dispatch`) | Sets all required Vercel env vars; auto-generates JWT_SECRET, QR_ENCRYPTION_KEY, VITE_QR_SECRET_KEY if not supplied |

### GitHub Secrets Required (add at: repo → Settings → Secrets and variables → Actions)

| Secret | Purpose | Required By |
|--------|---------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Management API auth | run-migrations.yml, deploy-supabase.yml |
| `VERCEL_TOKEN` | Vercel API auth | configure-vercel-env.yml |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key value | configure-vercel-env.yml |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key value | configure-vercel-env.yml |
| `REMITA_SECRET_KEY` | Remita payment secret value | configure-vercel-env.yml |
| `MONGODB_URI` | MongoDB connection string (optional — for Express server) | configure-vercel-env.yml |
| `CLIENT_URL` | Frontend deployment URL (optional) | configure-vercel-env.yml |
| `JWT_SECRET` | JWT signing key (optional — auto-generated if blank) | configure-vercel-env.yml |
| `QR_ENCRYPTION_KEY` | QR signing key (optional — auto-generated if blank) | configure-vercel-env.yml |
| `VITE_QR_SECRET_KEY` | Frontend AES-256 QR key (optional — auto-generated if blank) | configure-vercel-env.yml |

### Supabase Project Info
| Field | Value |
|-------|-------|
| Project Ref / ID | `ifpvklpkmokiagmxcsjq` |
| Project URL | `https://ifpvklpkmokiagmxcsjq.supabase.co` |
| Anon Key Prefix | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...anon...` (set as `VITE_SUPABASE_ANON_KEY` in Vercel) |
| Service Role Prefix | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...service_role...` (set as `SUPABASE_SERVICE_ROLE_KEY` in Vercel) |

> **NOTE:** The Supabase project was changed in Session 4 (old project: `gwyxyncowfinfcudjwpv` → new: `ifpvklpkmokiagmxcsjq`). Run the SQL migration `20260225000001_complete_schema.sql` in the new project's SQL Editor before going live.

### Vercel Project Info
| Field | Value |
|-------|-------|
| Project ID | `prj_ZeYQULfvJvpdlJ1McONSdMoYA00G` |

---

## Changelog

| Date | Session | Changes |
|------|---------|---------|
| 2026-02-24 | Session 1 | Initial project setup, frontend + backend scaffolding, Supabase integration, Anthropic design system |
| 2026-02-24 | Session 2 | Created claude.md, agent.md, tasks/; validated 7 reported bugs (4 misdiagnosed, 3 real); fixed Register.jsx (useEffect import + updateStudentData), ScanPortal.jsx (QR replay), server/src/app.js (ESM import order); removed vercel.json hardcoded secrets; documented full architecture reality |
| 2026-02-24 | Session 3 | Created supabase/migrations/ with SQL migration for qr_used column; created GitHub Actions workflows: run-migrations.yml (Supabase DB via Management API) and configure-vercel-env.yml (sets all Vercel env vars, auto-generates JWT/QR secrets); documented Supabase project ref, Vercel project ID, required GitHub Secrets |
| 2026-02-25 | Session 4 | **New Supabase project** (`ifpvklpkmokiagmxcsjq`). Created `20260225000001_complete_schema.sql` — full schema: all 4 tables + RLS policies + photos storage bucket + `handle_new_user` trigger. Fixed Google OAuth: `GoogleLoginButton.jsx` was redirecting to Express backend — now uses `supabase.auth.signInWithOAuth`. Fixed `AuthCallback.jsx` race condition (null `userType` fired redirect before `fetchProfile` completed). Redesigned `Register.jsx` to match Login/SignUp split-panel premium design. Fixed `App.jsx` `bg-slate-50` → `bg-parchment`. Updated GitHub Actions workflows to target new Supabase project ID. Remita test SK/PK provided by user — set as `REMITA_SECRET_KEY` env var in Vercel. |
| 2026-02-25 | Session 5 | **Production stabilization (10 bugs) + image upload root-cause investigation.** Fixed: Login redirect race condition (setTimeout → useEffect); vercel.json @vercel/node builder removed; api/verify-payment.js SUPABASE_URL fallback; DB migration 20260225000003 (verifications_examiner_select RLS + on_verification_approved SECURITY DEFINER trigger); ScanPortal broken profiles!user_id join → two queries; dead route /examiner/history → /examiner/scan; Footer never mounted in App.jsx; navbar padding py-12 → pt-28 on all dashboards; admin role added to student routes; isSupabaseConfigured export added to supabase.js. Image upload root-cause: proved "Can't find variable: supabase" was misidentified — actual error is StorageUnknownError("fetch failed") when env vars absent; applied pre-flight guard + upsert:true + specific error messages. |
| 2026-02-26 | Session 6 | **Full system audit (Priorities A–E).** A — Upload flow confirmed correct end-to-end (bucket, policies, URL generation, photo_url storage, UI rendering). B — Schema/RLS/trigger audit complete; all policies verified; both migrations must be run. C — Fixed Admin Dashboard: `profiles:user_id (name, email)` was invalid PostgREST join causing admin to always see mock data → replaced with two-query approach (students + profiles batch by user_id, using `full_name`). Fixed PrintQR: QR showed "Valid - Ready for Use" even after qr_used=true → added three-state status display including "Already Used" (security gap closed). D — Remita demo flow functional; production needs real RRR generation endpoint. E — Documentation sync complete. Build: 0 errors. |
