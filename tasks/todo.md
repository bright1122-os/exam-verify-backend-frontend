# ExamVerify — Active Work Tracker

## How to Use This File
- Add a plan with checkboxes BEFORE starting implementation
- Update checkbox status in real time as work progresses
- Add review notes and verification results after each task
- Never mark complete without evidence

---

## Session: 2026-02-24 — Project Handoff Initialization

### Status: COMPLETE

**Goal:** Initialize project operational files (agent.md, tasks/todo.md, tasks/lessons.md) per handoff requirements.

- [x] Read README.md
- [x] Read EXAMVERIFY_DOCUMENTATION.md
- [x] Search for agent.md, tasks/todo.md, tasks/lessons.md (confirmed missing)
- [x] Explore repo structure (exam-verify-system/, exam-verify-backend/)
- [x] Create agent.md at repo root
- [x] Create tasks/todo.md (this file)
- [x] Create tasks/lessons.md
- [x] Write PRECHECK SUMMARY
- [x] Commit and push to branch claude/project-handoff-setup-v6pY4

**Review Notes:**
- Operational files created fresh — they were absent from the repo at session start.
- Two backends identified: embedded (exam-verify-system/server/) and standalone (exam-verify-backend/).
- Security issue found: hardcoded secrets in exam-verify-system/vercel.json. Flagged in agent.md and lessons.md.
- Supabase dependency in frontend package.json — needs investigation.

---

---

## Session: 2026-02-24 — Bug Audit, Security Fix, and Architecture Documentation

### Status: COMPLETE

**Goal:** Create claude.md, validate 7 reported bugs, fix real bugs, fix known project issues, document architecture reality.

### Pre-work
- [x] Read all required markdown files (agent.md, tasks/todo.md, tasks/lessons.md, EXAMVERIFY_DOCUMENTATION.md)
- [x] Confirm claude.md does not exist → create it

### Bug Validation
- [x] Bug 1 (studentData ReferenceError) — MISDIAGNOSED. Real bug: Register.jsx uses `useEffect` without import; calls `updateStudentData()` not in useStore
- [x] Bug 2 (snake_case vs camelCase in Dashboard) — MISDIAGNOSED. Dashboard uses Supabase (PostgreSQL snake_case). Correct.
- [x] Bug 3 (initializeAuth response unwrapping) — MISDIAGNOSED. useStore uses Supabase Auth, not axios. No issue.
- [x] Bug 4 (signIn/signUp vs initializeAuth response shape) — MISDIAGNOSED. Supabase SDK consistent throughout.
- [x] Bug 5 (QR incompatibility AES vs JWT) — PARTIALLY VALID. Real bug: ScanPortal replay — verifyStudent doesn't check qr_used, handleApprove doesn't mark qr_used=true.
- [x] Bug 6 (replay logic in server/src/controllers/qr.js) — MISLOCATED. Express qr.js is correct. Real replay bug was in ScanPortal.jsx.
- [x] Bug 7 (ESM imports after executable code in server/src/app.js) — VALID.

### Issue Validation
- [x] Issue A (hardcoded secrets in vercel.json) — CONFIRMED and FIXED.
- [x] Issue B (dual backend) — Documented clearly in claude.md. server/ = Express+MongoDB (dormant for frontend); api/ = active Vercel serverless.
- [x] Issue C (Supabase) — RESOLVED. Supabase is the PRIMARY data layer. Not dead code.
- [x] Issue D (QR scanner library) — RESOLVED. jsqr is correct and active. Documented in claude.md.
- [x] Issue E (docs/structure consistency) — RESOLVED. claude.md created with full architecture truth.

### Fixes Applied
- [x] Register.jsx: Added `useEffect` import (was missing; caused ReferenceError)
- [x] useStore.js: Added `updateStudentData` action (Register.jsx calls it; was undefined)
- [x] ScanPortal.jsx: Added `qr_used` check in `verifyStudent()` — rejects already-used passes
- [x] ScanPortal.jsx: Added `qr_used=true` Supabase update in `handleApprove()` — closes replay loop
- [x] server/src/app.js: Moved route imports to top of file (Bug 7 fix)
- [x] vercel.json: Removed MONGODB_URI, JWT_SECRET, QR_ENCRYPTION_KEY from env block

### Operational Files
- [x] Create claude.md at repo root with full architecture documentation
- [x] Update tasks/todo.md (this file)
- [x] Update tasks/lessons.md with new lesson patterns

### Verification
- [x] Frontend build: `vite build` → ✓ 2563 modules, 0 errors, 16.41s
- [x] Bug 7 fix: all imports at top of app.js (lines 1-14 confirmed)
- [x] Issue A fix: no secrets in vercel.json (confirmed by read)
- [x] Lint: 9 pre-existing issues — none introduced by this session's changes

**Review Notes:**
- The actual architecture differs from EXAMVERIFY_DOCUMENTATION.md which describes MongoDB-only. The real frontend is Supabase-primary.
- Pre-existing lint errors (unused vars, hook deps) not fixed per blast radius rule.
- MANUAL ACTION REQUIRED: Rotate MongoDB password, generate new JWT_SECRET, QR_ENCRYPTION_KEY — see deferred items below.

---

---

## Session: 2026-02-24 — Production Setup via GitHub Actions (CI/CD Integration)

### Status: IN PROGRESS

**Goal:** Complete all deferred production setup items using GitHub Actions as the CI/CD automation layer. Network restrictions in this environment block direct API calls to Supabase and Vercel, so all external operations are delegated to GitHub Actions workflows which run on GitHub's unrestricted servers.

**Context:**
- Supabase Project ID: `gwyxyncowfinfcudjwpv` (confirmed from `deploy-supabase.yml`)
- Supabase Access Token: provided by user (stored as `secrets.SUPABASE_ACCESS_TOKEN` in GitHub)
- Vercel Token: provided by user (to be stored as `secrets.VERCEL_TOKEN` in GitHub)
- `VITE_SUPABASE_URL` inferred from project ID: `https://gwyxyncowfinfcudjwpv.supabase.co`
- SECURITY: No token values may appear in any committed file — all must reference GitHub Secrets

**Pending Inputs Still Needed From User:**
- [ ] Vercel project name/slug (e.g. `exam-verify-system`)
- [ ] `VITE_SUPABASE_ANON_KEY` value (from Supabase dashboard → Settings → API → anon public key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` value (from Supabase dashboard → Settings → API → service_role)
- [ ] `REMITA_SECRET_KEY` value (from Remita dashboard)

**What Agent Can Generate Locally (no external access needed):**
- New `VITE_QR_SECRET_KEY` (random 48-char hex)
- New `JWT_SECRET` (random 96-char hex / 48 bytes)
- New `QR_ENCRYPTION_KEY` (random 48-char hex / 24 bytes)

### Plan

#### Phase 1 — Supabase DB Migration (add `qr_used` column)
- [x] Create `supabase/migrations/` directory with SQL migration file
- [x] SQL: `ALTER TABLE students ADD COLUMN IF NOT EXISTS qr_used BOOLEAN DEFAULT FALSE;` + `qr_used_at TIMESTAMPTZ`
- [x] Create `.github/workflows/run-migrations.yml` — applies migration via Supabase Management API on push to main or manual trigger

#### Phase 2 — Vercel Environment Variables (via GitHub Actions)
- [x] Create `.github/workflows/configure-vercel-env.yml` (workflow_dispatch, reads from GitHub Secrets)
- [x] Workflow sets all required env vars via Vercel REST API (no secrets in file)
- [x] Workflow auto-generates JWT_SECRET, QR_ENCRYPTION_KEY, VITE_QR_SECRET_KEY if not supplied as secrets
- [x] Workflow upserts env vars (creates if new, patches if already exists)
- [x] Workflow triggers Vercel redeploy after setting vars

#### Phase 3 — Generate New Secrets
- [x] JWT_SECRET: auto-generated by workflow (`openssl rand -hex 48`) → masked in logs → set directly in Vercel
- [x] QR_ENCRYPTION_KEY: auto-generated (`openssl rand -hex 24`) → masked → set in Vercel
- [x] VITE_QR_SECRET_KEY: auto-generated (`openssl rand -hex 32`) → masked → set in Vercel

#### Phase 4 — MongoDB Credential Rotation (manual — cannot automate)
- [ ] URGENT: User must rotate `agwunobisomtochukwu_db_user` password in MongoDB Atlas
- [ ] After rotation: user adds new `MONGODB_URI` as GitHub Secret → re-run configure-vercel-env.yml

#### Phase 5 — Supabase RLS Policies (optional follow-up)
- [ ] Create migration for RLS policies — pending user request

#### Phase 6 — Verify and Update Docs
- [x] Update `claude.md` changelog and CI/CD docs
- [x] Schema table updated with `qr_used_at` column
- [ ] Verify workflows run cleanly (requires push to main and workflow trigger)

### ACTION REQUIRED — User Must Do These Steps

**Step 1: Add GitHub Secrets** (repo → Settings → Secrets and variables → Actions)

| Secret Name | Value Source | Required? |
|-------------|-------------|-----------|
| `VERCEL_TOKEN` | Provided by user (do NOT commit this value) | YES |
| `SUPABASE_ACCESS_TOKEN` | Provided by user (do NOT commit this value) | YES |
| `VITE_SUPABASE_ANON_KEY` | From Supabase → Settings → API → anon/public | YES |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API → service_role | YES |
| `REMITA_SECRET_KEY` | From Remita dashboard | YES |
| `MONGODB_URI` | New MongoDB URI after rotating password | Optional |
| `CLIENT_URL` | Your Vercel deployment URL | Optional |

**Step 2: Trigger the migration workflow**
→ GitHub repo → Actions tab → "Run Supabase Database Migrations" → Run workflow

**Step 3: Trigger the Vercel env var workflow**
→ GitHub repo → Actions tab → "Configure Vercel Environment Variables" → Run workflow

**Step 4: Rotate MongoDB Atlas password** (SECURITY - was exposed)
→ MongoDB Atlas → Database Access → `agwunobisomtochukwu_db_user` → Edit → Set new password
→ Add new `MONGODB_URI` to GitHub Secrets
→ Re-run configure-vercel-env.yml

### Deferred Items
- [ ] MongoDB Atlas password rotation (user action - urgent security)
- [ ] Supabase RLS policies (optional - Phase 5)

---

---

## Session: 2026-02-25 — Full Debug + New Supabase Project + Google OAuth Fix

### Status: IN PROGRESS (commit + push pending)

**User-reported issues this session:**
1. Image upload fails with "database failed" — caused by missing tables in new Supabase project
2. Register.jsx UI doesn't fit the design — fixed with split-panel redesign
3. Google OAuth Error 400 redirect_uri_mismatch — partially code, partially Supabase/Google Cloud config

**New Supabase project:** `ifpvklpkmokiagmxcsjq` (replaced old `gwyxyncowfinfcudjwpv`)
**Supabase URL:** `https://ifpvklpkmokiagmxcsjq.supabase.co`

### Code Changes
- [x] Created `supabase/migrations/20260225000001_complete_schema.sql` — full schema for new project
  - profiles, students, payments, verifications tables
  - Full RLS policies for all tables
  - photos storage bucket (public read, authenticated write)
  - `handle_new_user` trigger (auto-creates profile on signup for email AND Google OAuth)
- [x] Redesigned `Register.jsx` — split-panel layout matching Login/SignUp design
  - Left panel: dark ink background, step progress sidebar
  - Right panel: parchment background, step form
  - Uses all design tokens: `text-anthracite`, `text-stone`, `bg-parchment`, `btn-primary`
- [x] Fixed `AuthCallback.jsx` — added `isProcessing` guard to prevent redirect before `fetchProfile` completes
- [x] Fixed `GoogleLoginButton.jsx` — was redirecting to `VITE_API_URL/auth/google` (Express backend); now uses `supabase.auth.signInWithOAuth`
- [x] Fixed `App.jsx` — `bg-slate-50` → `bg-parchment`
- [x] Updated `run-migrations.yml` — new project ID `ifpvklpkmokiagmxcsjq`
- [x] Updated `configure-vercel-env.yml` — new Supabase URL `https://ifpvklpkmokiagmxcsjq.supabase.co`
- [x] Updated `claude.md` — new project info + session 4 changelog

### MANDATORY USER ACTIONS (cannot be automated — require Supabase/Google Cloud dashboards)

#### Action 1: Run SQL Migration (BLOCKING — app won't work without tables)
1. Go to Supabase dashboard → `ifpvklpkmokiagmxcsjq` project
2. Click **SQL Editor** → **New Query**
3. Paste contents of `exam-verify-system/supabase/migrations/20260225000001_complete_schema.sql`
4. Click **Run** — should end with `✓ Schema verification passed`

#### Action 2: Fix Google OAuth redirect_uri_mismatch
The error is a **configuration mismatch**, NOT a code bug. Two places must be configured:

**In Google Cloud Console** (console.cloud.google.com):
1. Go to APIs & Services → Credentials → your OAuth 2.0 Client ID
2. Under **Authorized redirect URIs**, add EXACTLY:
   ```
   https://ifpvklpkmokiagmxcsjq.supabase.co/auth/v1/callback
   ```
3. Save

**In Supabase Dashboard** (`ifpvklpkmokiagmxcsjq` project):
1. Authentication → Providers → Google
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Under **Auth Settings** (Authentication → URL Configuration):
   - **Site URL**: `https://your-app.vercel.app` (your actual Vercel deployment URL)
   - **Additional Redirect URLs**: add `https://your-app.vercel.app/auth/callback`
5. Save

#### Action 3: Verify Vercel Environment Variables
Confirm these are set in Vercel dashboard (Settings → Environment Variables):
| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ifpvklpkmokiagmxcsjq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The anon JWT key provided |
| `SUPABASE_SERVICE_ROLE_KEY` | The service role JWT key provided |
| `REMITA_SECRET_KEY` | The `sk_test_...` key provided |
| `VITE_QR_SECRET_KEY` | Any random 32+ char string |

#### Action 4: Redeploy on Vercel
After setting env vars and running the SQL migration, trigger a new Vercel deployment.

### Deferred
- [ ] Supabase RLS policies testing (confirm no unintended data exposure)
- [ ] Production Remita keys (currently using test keys)

---

## Completed Tasks Archive

| Date | Task | Result |
|------|------|--------|
| 2026-02-24 | Project handoff initialization — create operational files | Complete |
| 2026-02-24 | Bug audit (7 bugs), security fix, architecture docs | Complete — 3 real bugs fixed, 4 misdiagnosed, secrets removed, claude.md created |
