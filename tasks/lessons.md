# ExamVerify — Lessons Learned

## How to Use This File
- Review this file at the start of every session
- Add new entries after any user correction or newly discovered bug pattern
- Format: Mistake → Root Cause → Prevention Rule → Detection

---

## Lesson 001 — Hardcoded Secrets in Deployment Config

**Discovered:** 2026-02-24 (session initialization)

**Mistake Pattern:**
`exam-verify-system/vercel.json` contains hardcoded secrets in plain JSON:
- `MONGODB_URI` (includes credentials)
- `JWT_SECRET`
- `QR_ENCRYPTION_KEY`

**Root Cause:**
Secrets were placed directly in the `env` block of vercel.json for convenience during early development/deployment setup, but this file is tracked by git and visible in the repository.

**Impact:**
- MongoDB credentials are publicly accessible to anyone with repo access.
- JWT and QR signing keys are exposed, allowing token forgery.
- Any deployed tokens signed with the exposed keys should be considered compromised.

**Prevention Rule:**
- NEVER commit secrets to vercel.json, .env files, or any tracked config file.
- Use the `vercel env add` CLI command or Vercel dashboard for all production secrets.
- The `env` block in vercel.json should only contain non-sensitive build-time settings.
- Add `vercel.json` to code review checklist: scan for credential fields before any commit.

**How to Detect:**
- Run `grep -r "mongodb+srv" .` before any commit to catch leaked DB URIs.
- Use `git diff --staged` and visually inspect env blocks in any JSON config files.
- Set up a pre-commit hook to scan for known secret patterns.

**Remediation Steps (when assigned):**
1. Rotate the MongoDB password immediately.
2. Generate a new JWT_SECRET (64+ char random string).
3. Generate a new QR_ENCRYPTION_KEY (32+ char random string).
4. Remove the `env` block from vercel.json (or replace with placeholder comments).
5. Add secrets to Vercel environment variables via dashboard or CLI.
6. Redeploy and verify the app still works with new keys.
7. Invalidate all existing JWTs (change secret makes old tokens unverifiable).

---

## Lesson 002 — Missing Operational Files at Repo Initialization

**Discovered:** 2026-02-24 (session initialization)

**Mistake Pattern:**
agent.md, tasks/todo.md, and tasks/lessons.md were listed as existing in the handoff documentation but were absent from the actual repository.

**Root Cause:**
Previous agent session completed the handoff documentation but did not initialize the operational files it referenced.

**Prevention Rule:**
- At the start of every new session, verify that all referenced operational files actually exist before citing them.
- If files are missing, create them before proceeding — do not assume they exist based on documentation claims.
- The PRECHECK SUMMARY must explicitly note any missing files as a conflict flag.

**How to Detect:**
- Run `find . -name "agent.md" -o -name "todo.md" -o -name "lessons.md"` at session start.
- If output is empty, create files immediately before any other work.

---

## Lesson 003 — Two Backends, Unclear Active One

**Discovered:** 2026-02-24 (session initialization)

**Mistake Pattern:**
The repository contains two backend implementations:
- `exam-verify-system/server/` — Lean backend integrated with the Vercel deployment
- `exam-verify-backend/` — Standalone backend with full services/utils/config layers

Without investigation, it would be easy to modify the wrong one.

**Root Cause:**
The project evolved with a standalone backend that was later partially re-implemented as an embedded Vercel serverless backend for the combined frontend+backend deployment.

**Prevention Rule:**
- Before any backend change, confirm WHICH backend is being changed.
- The `vercel.json` in `exam-verify-system/` references `server/src/app.js`, so that is the active Vercel-deployed backend.
- The standalone `exam-verify-backend/` may be for a separate deployment (e.g., Render).
- Always state which backend you are modifying in the plan.

**How to Detect:**
- Check `exam-verify-system/vercel.json` for the active server entry point.
- Check `exam-verify-backend/` for an independent deployment config (e.g., render.yaml, Procfile).

---

## Lesson 004 — Supabase Dependency in MongoDB-Documented Project

**Discovered:** 2026-02-24 (session initialization)

**Mistake Pattern:**
`exam-verify-system/package.json` includes `@supabase/supabase-js` as a dependency, but the project documentation (EXAMVERIFY_DOCUMENTATION.md) only describes a MongoDB/Mongoose backend. The Supabase client is imported but its usage scope is unknown.

**Root Cause:**
Unknown — could be a leftover from an earlier version that used Supabase, or it might be actively used for a specific feature not covered in the documentation.

**Prevention Rule:**
- Before any database-related changes, grep for `supabase` imports in the frontend source code.
- If Supabase is actively used for certain features, document which ones and do not break those flows when working on MongoDB-backed features.
- Do not remove the dependency without full impact analysis.

**How to Detect:**
- Run `grep -r "supabase" exam-verify-system/src/ --include="*.jsx" --include="*.js"` to find all usage points.

---

## Lesson 005 — Bug Reports Written for Wrong Architecture

**Discovered:** 2026-02-24 (session 2 — bug audit)

**Mistake Pattern:**
4 of 7 reported bugs (Bugs 1, 2, 3, 4) were written assuming a MongoDB/Express/JWT frontend flow. The actual frontend uses Supabase Auth + Supabase PostgreSQL. Bug descriptions referenced patterns that don't exist in the code.

**Root Cause:**
EXAMVERIFY_DOCUMENTATION.md describes a MongoDB-only architecture. The actual implementation evolved to use Supabase for the frontend. Bug reports were written against the documented architecture, not the actual code.

**Impact:**
Risk of "fixing" correct code and introducing regressions while investigating non-existent bugs.

**Prevention Rule:**
- Always read actual source files before accepting a bug description as valid.
- Check `src/store/useStore.js` imports to identify the actual auth/data layer.
- Don't trust architecture documentation without verifying against actual imports and function calls.
- Run `grep -r "supabase\|axios\|fetch" src/` to quickly identify the real data layer.

**How to Detect:**
- Verify actual imports in store, lib/, and services/ before debugging data-layer issues.

---

## Lesson 006 — Missing React Hook Import Crashes Entire Page

**Discovered:** 2026-02-24 (session 2 — bug audit)

**Mistake Pattern:**
`Register.jsx` used `useEffect` on line 38 but imported only `useState, useRef` on line 1. `updateStudentData` was called from `useStore` but was not defined there. Both would cause runtime crashes.

**Root Cause:**
Files built incrementally — hooks/store actions added later without updating imports/store definitions.

**Prevention Rule:**
- When adding a hook call, immediately verify the import line includes it.
- When destructuring a store action, verify the action is defined in the store.
- Cross-check all `useStore()` destructured items against the store's actual exported actions.

**How to Detect:**
- `grep -n "useEffect\|useCallback\|useMemo" file.jsx` then verify it appears in the import statement.
- For store actions: compare destructured names in components against actual useStore definitions.

---

## Lesson 007 — QR Replay Vulnerability: State Transition Must Be Atomic with Side Effect

**Discovered:** 2026-02-24 (session 2 — bug audit)

**Mistake Pattern:**
`ScanPortal.jsx` `handleApprove()` inserted a verification record but never marked `qr_used=true` on the student. `verifyStudent()` also never checked `qr_used`. A student could be approved multiple times by different examiners.

**Root Cause:**
The approval flow was implemented in two steps (insert verification, update student) but the second step was omitted.

**Prevention Rule:**
- For any "mark as used" flow: the state transition MUST accompany the side effect (both insert + update).
- Always ask: "What prevents this action from being repeated?" when implementing approval flows.
- After any approval: the source resource must be marked consumed/used in the same operation.

**How to Detect:**
- Search for `insert` on audit/verification tables without a corresponding `update` on the source record.

---

## Template for New Lessons

```
## Lesson NNN — Title

**Discovered:** YYYY-MM-DD (context)

**Mistake Pattern:**
[What went wrong or almost went wrong]

**Root Cause:**
[Why it happened]

**Impact:**
[What was or could be affected]

**Prevention Rule:**
[Specific rule to follow going forward]

**How to Detect:**
[Concrete check or command to catch this early]
```
