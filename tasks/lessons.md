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

## Lesson 008 — New Supabase Project = No Tables (Everything Breaks)

**Discovered:** 2026-02-25 (session 4 — production setup)

**Mistake Pattern:**
When a new Supabase project is created (`ifpvklpkmokiagmxcsjq`), NONE of the required tables (profiles, students, payments, verifications) or storage buckets exist. ALL database operations fail silently as "database failed" errors even though the code is correct.

**Root Cause:**
The old migration only added the `qr_used` column (ALTER TABLE), assuming the base tables existed. Switching to a new project requires a full schema creation migration.

**Impact:**
- Image upload fails ("database failed") — storage bucket doesn't exist
- Student record insert fails — `students` table doesn't exist
- Profile lookup fails — `profiles` table doesn't exist
- All auth-dependent flows silently break

**Prevention Rule:**
- Whenever the Supabase project changes, create a `00_complete_schema.sql` migration that creates ALL tables from scratch using `CREATE TABLE IF NOT EXISTS`
- The migration must include: tables, RLS policies, storage buckets, and the `handle_new_user` trigger
- Document the project ID in `claude.md` and verify it matches in every workflow file

**How to Detect:**
- `grep -r "gwyxyncowfinfcudjwpv\|ifpvklpkmokiagmxcsjq" .github/` — confirm workflow project IDs match the active project
- Check `claude.md` Supabase Project Info section for the current project ID
- If any Supabase operation returns "relation does not exist" → run the complete schema migration

---

## Lesson 009 — Google OAuth redirect_uri_mismatch Is Always Config, Not Code

**Discovered:** 2026-02-25 (session 4)

**Mistake Pattern:**
`Error 400: redirect_uri_mismatch` during Google OAuth is ALWAYS a Supabase + Google Cloud Console configuration problem, not a frontend code bug. Trying to fix it by changing `redirectTo` in the code does not solve it.

**Root Cause:**
Google's OAuth requires the EXACT redirect URI to be whitelisted in Google Cloud Console. Supabase uses `https://[project-ref].supabase.co/auth/v1/callback` as the redirect URI — this exact string must be in Google's allowed list.

**Prevention Rule:**
After ANY Supabase project change, immediately update Google Cloud Console → OAuth Client → Authorized redirect URIs to `https://[new-project-ref].supabase.co/auth/v1/callback`

**How to Detect:**
- Error message "redirect_uri_mismatch" in browser → always check Google Cloud Console authorized URIs
- After a project ID change: `grep` for old project ref in `claude.md`, workflows, and Supabase Auth settings

---

## Lesson 010 — Race Condition: useEffect on Zustand State Fires Before Async Fetch

**Discovered:** 2026-02-25 (session 4)

**Mistake Pattern:**
`AuthCallback.jsx` had a `useEffect([userType])` that checked `userType === null` and redirected to `/`. Since `userType` starts as `null` in the Zustand store, this effect fired IMMEDIATELY on mount — before `fetchProfile()` could complete — causing all Google OAuth users to be redirected to `/` instead of their dashboard.

**Root Cause:**
React's `useEffect` runs synchronously after render. If Zustand state has a falsy initial value (`null`) and a useEffect checks that value, it will fire on the first render before any async operation updates the state.

**Prevention Rule:**
- Never trigger navigation based on a Zustand value that starts as `null` without a `isProcessing` guard
- Pattern: add a local `isProcessing` state, start as `true`, set to `false` in the `finally` block of the async operation, and gate all redirections behind `if (isProcessing) return`

**How to Detect:**
- Any `useEffect([someStoreValue])` that navigates when `someStoreValue === null` is a potential race condition
- If a callback/redirect page immediately redirects without completing the intended operation → check for this pattern

---

## Lesson 011 — "Can't Find Variable" Is Often a Misidentified Error — Verify From Code Before Accepting the Label

**Discovered:** 2026-02-25 (Session 5 — image upload root-cause investigation)

**Mistake Pattern:**
An error was labeled "Can't find variable: supabase when uploading an image" and accepted as a missing-import bug without verifying the actual code. The previous session's report filed this as "Safari-specific / likely module race" — another unverified guess.

**Root Cause (proven by code + git history):**
- Checked ALL commits from ca0da23 to bc55064 (entire project history)
- Every version of Register.jsx has `import { supabase } from '../../lib/supabase'` on line 8/11
- Every version of lib/supabase.js exports `supabase` correctly with fallback values
- `createClient` tested in Node.js: with fallback strings ('https://placeholder.supabase.co', 'placeholder-key') → does NOT throw, creates valid client object
- When env vars are missing: actual runtime error is `StorageUnknownError { message: "fetch failed" }` shown via `toast.error("fetch failed")` — NOT a ReferenceError
- The "Can't find variable: supabase" label was a **misidentification of the actual failure**; the real failure is the upload network request failing because `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are not configured

**Impact:**
- Wrong diagnosis → wrong fix (blaming Safari, import order, etc.)
- Actual upload failures left unfixed with generic "Registration failed" toast
- Users get no actionable guidance about what went wrong

**Prevention Rule:**
- NEVER accept an error label without verifying it against actual code
- For "variable not defined" errors: run `grep -rn "import.*supabase" src/` to confirm — if import exists, the label is wrong
- For upload failures: trace the exact error object type (StorageUnknownError vs ReferenceError) to distinguish config from code bugs
- Add pre-flight guards in critical paths: check `isSupabaseConfigured` before attempting any Supabase operation and throw a clear, actionable error if not

**How to Detect:**
- `node -e "const {createClient} = require('@supabase/supabase-js'); createClient('https://placeholder.supabase.co', 'x').storage.from('b').upload('f', Buffer.from('t')).then(r => console.log(r))"` → shows `"fetch failed"`, proving the real error, not a ReferenceError
- Run `grep -rn "supabase" src/ --include="*.jsx"` and cross-reference with `grep -rn "import.*supabase" src/` — if they match, there is no missing import

---

## Lesson 012 — Missing RLS SELECT Policy Makes Dashboard Always Show Zero

**Discovered:** 2026-02-25 (Session 5 — examiner dashboard debugging)

**Mistake Pattern:**
Examiners could INSERT into `verifications` but had no SELECT policy. The Dashboard's stat queries returned `count: 0` and the history list was always empty — silently, with no error.

**Root Cause:**
RLS in Supabase is deny-by-default. INSERT and SELECT are independent permissions. Writing an INSERT policy does not grant SELECT. The `verifications_examiner_insert` policy was created but `verifications_examiner_select` was omitted.

**Impact:**
- Examiner dashboard showed 0 verifications total, 0 today, 0 approved/denied — regardless of actual data
- No error was thrown — Supabase just returned 0 rows for the COUNT query

**Prevention Rule:**
- For any table that a role writes to, explicitly add BOTH an INSERT policy AND a SELECT policy
- After any new table is created, enumerate all roles and ask: "Can this role SELECT from this table? INSERT? UPDATE? DELETE?" and create policies for each needed operation
- Use `EXPLAIN` on any query that returns unexpected 0 results — often points to RLS blocking

**How to Detect:**
- If a dashboard shows 0 for everything despite data existing → run the same query in Supabase SQL Editor as the anon/service role
- Check `pg_policies` view: `SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'verifications';` — if no SELECT policy for examiner role exists, that's the bug

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
