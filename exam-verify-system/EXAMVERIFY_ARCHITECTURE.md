# ExamVerify — System Architecture & Flow Documentation
> Generated: 2026-02-25 | Status: Production-Ready Post-Stabilization

---

## 1. SYSTEM OVERVIEW

ExamVerify is a university examination hall security system. It replaces manual student ID checking with cryptographic QR-code-based verification, tied to fee payment status and photo identity.

**Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, Zustand, React Router v7, TailwindCSS |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Storage | Supabase Storage (`photos` bucket) |
| Payment Verification | Remita (via Vercel Serverless Function) |
| QR Encryption | AES-256 via `crypto-js` |
| Hosting | Vercel (SPA + Serverless Functions) |

---

## 2. ROLES

| Role | Access | Description |
|---|---|---|
| `student` | Student portal + Settings | Registers, pays fee, generates QR pass |
| `examiner` | Examiner portal + Settings | Scans QR codes at hall entry |
| `admin` | All portals + Settings | Full oversight; can view student and examiner pages |

Role is stored in `public.profiles.role` (set at signup via `handle_new_user` trigger or explicitly by admin).

---

## 3. AUTH FLOW

```
User visits /auth/signup or /auth/login
    ↓
Email/Password signup  → supabase.auth.signUp({ email, password, options: { data: { name, role } } })
  OR Google OAuth      → supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Supabase fires handle_new_user trigger
    → INSERT INTO profiles (id, full_name, role)
    → role defaults to metadata.role OR 'student'
    ↓
On login: supabase.auth.signInWithPassword()
    → onAuthStateChange fires in useStore
    → fetchProfile(userId) reads profiles table
    → sets userType in Zustand store
    ↓
Login.jsx useEffect watches { isAuthenticated, userType }
    → navigates to correct portal dashboard
    ↓
Google OAuth redirect lands at /auth/callback
    → AuthCallback.jsx calls fetchProfile()
    → redirects based on userType
```

**Key Files:** `src/store/useStore.js`, `src/pages/auth/Login.jsx`, `src/pages/auth/AuthCallback.jsx`

---

## 4. STUDENT REGISTRATION & PROFILE FLOW

```
/student/register (4 steps)
    ↓
STEP 1 — Identity
  User fills: matricNumber, faculty, department, level
  Validation: react-hook-form (required fields)
    ↓
STEP 2 — Photo Upload
  User selects image (JPG/PNG/WEBP, max 10MB)
  On "Continue":
    → supabase.storage.from('photos').upload(fileName, file)
    → getPublicUrl() returns photo_url
    → supabase.from('students').insert({ user_id, matric_number, faculty,
        department, level, photo_url, registration_complete: true })
    → supabase.from('payments').insert({ user_id, amount: 5000, rrr: 'TEST-SUCCESS', status: 'pending' })
    ↓
STEP 3 — Payment Verification
  Displays RRR + amount
  User clicks "Verify Payment":
    → POST /api/verify-payment { rrr, amount, user_id }
    → Server checks Remita (or bypasses for TEST-SUCCESS)
    → Server updates: payments.status = 'verified'
    → Server updates: students.payment_verified = true, qr_generated = true
    ↓
STEP 4 — Complete
  Navigate to /student/dashboard
```

**Key Files:** `src/pages/student/Register.jsx`, `api/verify-payment.js`

---

## 5. IMAGE UPLOAD FLOW

```
Student selects image file (Register.jsx Step 2)
    ↓
handlePhotoChange() validates size (< 10MB) and type (jpg/png/webp)
    ↓
uploadPhoto() called when user clicks "Continue":
    → fileName = `{user.id}-{timestamp}.{ext}`
    → supabase.storage.from('photos').upload(fileName, file, { upsert: false })
    → supabase.storage.from('photos').getPublicUrl(fileName)
    → returns publicUrl string
    ↓
publicUrl stored as students.photo_url
    ↓
Photo displayed in:
    - Student Dashboard (profile card)
    - PrintQR card
    - ScanPortal result card (examiner sees it)
```

**Storage bucket:** `photos` (public, max 10MB, image types only)
**RLS:** Authenticated users can upload; anyone can read (public bucket)

---

## 6. PAYMENT FLOW (REMITA)

```
Register.jsx inserts payment record with rrr = 'TEST-SUCCESS' (demo)
    ↓
User clicks "Verify Payment" on Step 3
    ↓
POST /api/verify-payment { rrr, amount, user_id }
    ↓
api/verify-payment.js (Vercel Serverless Function):
    → If rrr === 'TEST-SUCCESS': force isSuccess = true (demo bypass)
    → Else: GET https://remitademo.net/payment/v1/payment/status/{rrr}
        → Bearer token: REMITA_SECRET_KEY
        → Check: responseCode === '00' OR status === 'success'
    ↓
On success:
    → supabaseAdmin.from('payments').update({ status: 'verified' })
    → supabaseAdmin.from('students').update({ payment_verified: true, qr_generated: true })
    ↓
Frontend advances to Step 4 (Complete)
```

**Error Paths:**
- Remita unreachable → 502 "Payment gateway unreachable"
- Remita rejects → 400 "Payment not confirmed by Remita"
- Missing server config → 500 "Server configuration error"
- TEST-SUCCESS always passes (remove in strict production)

**Key Files:** `api/verify-payment.js`, `supabase/functions/verify-payment/index.ts` (Edge Function alternative)

---

## 7. QR GENERATION & VERIFICATION FLOW

### QR Generation (PrintQR.jsx)
```
Student navigates to /student/qr-code
    ↓
Fetch students record — check qr_generated = true
    ↓
Build payload: { id: student.id, matric: matric_number, generatedAt, verifier: 'exam-verify-system' }
    ↓
encryptQRData(payload) → AES-256 encrypt with VITE_QR_SECRET_KEY
    ↓
<QRCodeSVG value={encryptedPayload} level="H" size={192} />
    ↓
Student prints or downloads the QR card
```

### QR Verification (ScanPortal.jsx)
```
Examiner opens /examiner/scan
    ↓
Camera mode: jsQR scans video frames → detects QR string
  OR Manual mode: examiner types matric number
    ↓
QR mode:
    decryptQRData(qrString) → parse JSON payload
    → verify: qrData.verifier === 'exam-verify-system'
    → call verifyStudent(qrData.id)

Manual mode:
    supabase.from('students').select(*).ilike('matric_number', input)
    → call verifyStudent(student.id)
    ↓
verifyStudent(studentId):
    → SELECT student WHERE id = studentId
    → SELECT profile WHERE id = student.user_id
    → Check: registration_complete, payment_verified, qr_generated, !qr_used
    ↓
If valid: show result card with student photo + info
    Examiner fills exam hall → clicks "Approve Entry"
    → INSERT INTO verifications { student_id, examiner_id, status: 'approved', exam_hall, notes }
    → DB trigger on_verification_approved fires:
        UPDATE students SET qr_used = true, qr_used_at = NOW()
    ↓
If invalid: show error message with reason
    Examiner can deny:
    → INSERT INTO verifications { ..., status: 'denied', denial_reason }
```

**Security:** QR is single-use (`qr_used` flag); replay is blocked at the DB level by the trigger.

---

## 8. EXAMINER DASHBOARD FLOW

```
/examiner/dashboard
    ↓
Fetch today's stats:
    COUNT verifications WHERE scanned_at >= today AND status = 'approved' | 'denied'
    ↓
Fetch all-time stats:
    COUNT verifications (approved, denied, total)
    ↓
Fetch recent history:
    SELECT verifications JOIN students (matric_number) ORDER BY scanned_at DESC LIMIT 10
    ↓
Subscribe to realtime:
    supabase.channel('verifications-db-changes')
    .on('postgres_changes', { event: 'INSERT', table: 'verifications' }, callback)
    → Optimistically update stats + history on new scan
```

---

## 9. ADMIN DASHBOARD FLOW

```
/admin/dashboard (role: 'admin' only)
    ↓
Fetch: students count, payments (verified/pending), verifications (by day, last 7 days)
    ↓
Display: SVG bar chart of daily verifications, donut chart of payment status,
         student list with search + pagination
    ↓
Admin can view all student records (RLS: students_admin_all policy)
```

---

## 10. ERROR HANDLING PATHS

| Scenario | Handler | User Feedback |
|---|---|---|
| Missing Supabase env vars | `src/lib/supabase.js` console.error | Console warning; placeholder client created |
| Image upload failure | `uploadPhoto()` try/catch | `toast.error(error.message)` |
| DB insert failure (registration) | `nextStep()` try/catch | `toast.error(error.message)` |
| Payment gateway unreachable | `api/verify-payment.js` | 502 → `toast.error('Could not verify payment')` |
| QR decrypt failure | `handleQRDetected()` catch | Result card shows "Invalid or Tampered QR Code" |
| Student not found | `verifyStudent()` throw | Result card shows error |
| Entry already used | `verifyStudent()` check | Result card: "This exam pass has already been used" |
| Auth callback error | `AuthCallback.jsx` catch | Error message + redirect to login after 3s |
| Role mismatch | `ProtectedRoute` | Redirect to `/` |

---

## 11. REALTIME / EVENT BEHAVIOR

- **Examiner Dashboard** subscribes to `verifications` INSERT via `supabase.channel()`
- New scan inserts trigger optimistic UI update (stats + history)
- No socket.io is used in production (socket service file exists but is not mounted)

---

## 12. ROUTING MAP

| Path | Component | Roles |
|---|---|---|
| `/` | Home | Public |
| `/auth/login` | Login | Public |
| `/auth/signup` | SignUp | Public |
| `/auth/callback` | AuthCallback | Public |
| `/student/dashboard` | StudentDashboard | student, admin |
| `/student/register` | StudentRegister | student, admin |
| `/student/qr-code` | PrintQR | student, admin |
| `/student/verification` | VerificationStatus | student, admin |
| `/examiner/dashboard` | ExaminerDashboard | examiner, admin |
| `/examiner/scan` | ScanPortal | examiner, admin |
| `/admin/dashboard` | AdminDashboard | admin |
| `/settings` | Settings | student, examiner, admin |
| `*` | → `/` | — |

---

## 13. DATABASE SCHEMA SUMMARY

| Table | Key Columns | RLS |
|---|---|---|
| `profiles` | id (FK auth.users), full_name, role | Own row only |
| `students` | user_id, matric_number, photo_url, registration_complete, payment_verified, qr_generated, qr_used, qr_used_at | Own row + examiner read + admin all |
| `payments` | user_id, amount, rrr, status | Own row + admin all |
| `verifications` | student_id, examiner_id, status, exam_hall, denial_reason, scanned_at | Examiner insert+select, admin all, student own-select |

**Triggers:**
- `on_auth_user_created` → auto-creates `profiles` row on signup
- `on_verification_approved` → sets `students.qr_used = true, qr_used_at = NOW()` when approved verification inserted (SECURITY DEFINER)

---

## 14. ENVIRONMENT VARIABLES REFERENCE

| Variable | Where Used | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend (browser) | Yes |
| `VITE_SUPABASE_ANON_KEY` | Frontend (browser) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel API function only | Yes (production) |
| `SUPABASE_URL` | Vercel API function (fallback for server-side) | Optional (falls back to VITE_SUPABASE_URL) |
| `VITE_QR_SECRET_KEY` | Frontend — QR encryption | Recommended (has default fallback) |
| `REMITA_SECRET_KEY` | Vercel API function only | Yes (live Remita; skipped for TEST-SUCCESS) |
