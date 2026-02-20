# ExamVerify — Comprehensive Project Documentation

## University Exam Entry Verification System

---

## 1. Project Overview

ExamVerify is a secure, full-stack web application designed for Nigerian universities to digitally verify students' eligibility to sit for examinations. It replaces the traditional paper-based exam clearance process with a modern, encrypted QR-code-based system that is tamper-proof, time-limited, and verifiable in real time.

The system connects three user roles — **Students**, **Examiners**, and **Administrators** — through dedicated portals, each with tailored functionality.

---

## 2. Core Problem Statement

In many Nigerian universities, exam entry verification is manual: students present physical receipts or clearance slips at exam halls, which are prone to forgery, loss, and bottlenecks. ExamVerify solves this by digitizing the entire pipeline: payment verification via Remita, encrypted QR code generation, and real-time scanning at exam venues.

---

## 3. System Architecture

### Tech Stack

The backend (which you have uploaded) is a **Node.js/Express** API server with **MongoDB** (via Mongoose) as the database. The frontend (referenced but not uploaded) is a **React** (Vite) single-page application.

**Backend:**
- Runtime: Node.js (ES Modules)
- Framework: Express 5
- Database: MongoDB with Mongoose 9 ODM
- Authentication: JWT (jsonwebtoken) + Google OAuth 2.0 (passport-google-oauth20)
- File Storage: Cloudinary (with local fallback)
- Payment Integration: Remita API (RRR verification)
- QR Code: `qrcode` package (generation) + JWT-signed payloads
- Encryption: Node.js native `crypto` module (AES-256-CBC)
- Real-time: Socket.io for live scan events
- Security: Helmet, express-rate-limit, express-mongo-sanitize, bcryptjs
- Validation: Zod 4
- Logging: Winston

**Frontend (expected):**
- Framework: React 18+ with Vite
- Routing: React Router
- HTTP Client: Axios
- QR Scanning: html5-qrcode
- Styling: Anthropic-inspired design system (see Section 9)

### Architectural Pattern

The project follows a classic **MVC-like** layered architecture:

```
src/
├── config/          ← Database, Cloudinary, Passport, Socket.io configuration
├── controllers/     ← Route handler logic (auth, student, payment, QR, examiner, admin)
├── middleware/       ← Auth guards, rate limiters, file upload, validation, error handling
├── models/          ← Mongoose schemas (User, Student, Payment, Verification)
├── routes/          ← Express route definitions
├── services/        ← Business logic (Remita API, QR generation, file uploads)
├── socket/          ← Socket.io event handlers
├── utils/           ← Crypto helpers, logger, response formatters
└── server.js        ← App entry point
```

---

## 4. User Flows & Functionality

### 4.1 Student Portal

**Registration Flow:**
1. Student visits the sign-up page and provides: full name, email, password, and selects "Student" as their role.
2. Account is created in MongoDB via the `/api/v1/auth/register` endpoint. Password is hashed with bcrypt (12 salt rounds).
3. A JWT token is returned and stored client-side for subsequent authenticated requests.

**Profile Completion (one-time):**
1. After initial auth, the student completes their academic profile via `/api/v1/student/register`.
2. Required fields: matric number (unique, uppercase), department, faculty, level (100–500).
3. A **passport photograph** is uploaded (JPEG/PNG, max 10MB). The photo is uploaded to Cloudinary (or stored locally as a fallback) and the URL is saved to the Student document.
4. This registration step happens exactly once. The `registrationComplete` flag is set to `true`, and subsequent attempts return an error.

**Payment Verification Flow:**
1. The student has already paid their exam fee at a bank/cybercafe and received an RRR (Remita Retrieval Reference) number.
2. The student initiates payment via `/api/v1/payment/initiate`, which calls the Remita API to generate a formal RRR record linked to their account.
3. After paying, the student calls `/api/v1/payment/verify/:rrr`, which hits the Remita Status Check API on the backend to confirm payment.
4. The Remita API call is server-side only (to protect API keys). It uses SHA-512 hashing for authentication: `SHA512(merchantId + serviceTypeId + orderId + amount + apiKey)`.
5. On successful verification, the student's `paymentVerified` flag is set to `true`.

**QR Code Generation:**
1. Once payment is verified, a QR code is automatically generated.
2. The QR payload is a JWT-signed token containing: student ID, matric number, name, email, department, faculty, level, photo URL, a random 32-byte token, and the generation timestamp.
3. The JWT is signed with the `QR_ENCRYPTION_KEY` environment variable and has a 30-day expiry.
4. The QR code is rendered as a data URL (base64 PNG) using the `qrcode` package at 400×400px with high error correction.
5. The student can view/download this QR code from their dashboard via `/api/v1/qr/my-qr`.

**Student Dashboard:**
- Shows current status across all steps: registration, payment, QR generation, QR usage.
- Displays passport photo, academic details, and payment history.
- Accessible via `/api/v1/student/dashboard`.

### 4.2 Examiner Portal

**Authentication:**
- Examiners register with role "examiner" and authenticate via the same JWT-based system.
- Google OAuth is also available as an alternative sign-in method.

**QR Code Scanning (core feature):**
1. The examiner opens the scanner page, which activates the device camera (rear camera on mobile via `facingMode: "environment"`).
2. The camera reads the QR code, extracting the JWT string.
3. The frontend sends this JWT to `/api/v1/qr/verify` or `/api/v1/examiner/scan`.
4. The backend verifies the JWT signature, checks the token hasn't expired, confirms the embedded `qrToken` matches the student's database record, and verifies payment status.
5. If valid: the student's full details (name, matric, department, faculty, photo) are returned and displayed.
6. If invalid: specific error codes are returned — `EXPIRED`, `ALREADY_USED`, `TOKEN_MISMATCH`, `PAYMENT_NOT_VERIFIED`, `STUDENT_NOT_FOUND`, or `INVALID_FORMAT`.

**Entry Approval/Denial:**
1. After scanning, the examiner can approve entry via `/api/v1/examiner/approve` (requires student ID and exam hall name).
2. On approval: the student's `qrCodeUsed` flag is set to `true` with a timestamp, preventing re-use. A Verification record is created.
3. The examiner can also deny entry via `/api/v1/examiner/deny` (requires a denial reason).
4. Both actions emit real-time Socket.io events (`verification:approved` / `verification:denied`) to all connected examiners and admins.

**Examiner Dashboard:**
- Today's stats: approved count, denied count, total scans.
- All-time cumulative statistics.
- Full verification history with pagination via `/api/v1/examiner/history`.

### 4.3 Admin Portal

Admins have a comprehensive management dashboard with:

- **Dashboard Statistics** (`/api/v1/admin/stats`): Total students, registered count, paid count, QR generated/used counts, payment totals, verification breakdowns, and recent activity feed.
- **Student Management** (`/api/v1/admin/students`): List all students with search (by name or matric number) and status filtering. View individual student details including payment and verification history.
- **Manual Overrides** (`/api/v1/admin/students/:id/status`): Admin can manually toggle payment verification or QR usage status for edge cases.
- **Payment Monitoring** (`/api/v1/admin/payments`): View all payments with status filtering.
- **Verification Logs** (`/api/v1/admin/verifications`): Complete audit trail of all scan events, filterable by status and exam hall.
- **User Management** (`/api/v1/admin/users`): List all users, change roles between student/examiner/admin.

### 4.4 Google OAuth Flow

1. User clicks "Continue with Google" on the frontend.
2. Browser redirects to `/api/v1/auth/google`, which triggers Passport's Google OAuth 2.0 strategy.
3. After Google consent, the callback at `/api/v1/auth/google/callback` fires.
4. The Passport strategy checks: does a user with this Google ID exist? If yes, update `lastLogin` and sign in. Does a user with this email exist (registered via email/password)? If yes, link the Google ID and sign in. Otherwise, create a new user with the Google profile data and default "student" role.
5. A JWT is generated and the user is redirected to the frontend callback page: `CLIENT_URL/auth/callback?token=...&role=...`.

---

## 5. Data Model

### User (src/models/User.js)

The base identity for all users across all roles.

| Field | Type | Details |
|-------|------|---------|
| googleId | String | Unique, sparse index. Links to Google OAuth. |
| email | String | Required, unique, lowercase, trimmed. |
| name | String | Required, trimmed. |
| password | String | Min 6 chars, select: false (excluded from queries by default). Hashed with bcrypt (12 rounds) on save. |
| avatar | String | Profile image URL (from Google or uploaded). |
| role | String | Enum: "student", "examiner", "admin". Required. |
| isActive | Boolean | Default true. Set false to deactivate accounts. |
| lastLogin | Date | Updated on each sign-in. |
| timestamps | — | Auto createdAt/updatedAt. |

### Student (src/models/Student.js)

Extended student profile, linked 1:1 to a User document.

| Field | Type | Details |
|-------|------|---------|
| userId | ObjectId → User | Required, unique. One student profile per user. |
| matricNumber | String | Required, unique, uppercase, trimmed. |
| department | String | Required. |
| faculty | String | Required. |
| level | String | Enum: "100"–"500". Required. |
| photoUrl | String | Required. Cloudinary or local URL. |
| photoPublicId | String | Cloudinary public ID for deletion. |
| registrationComplete | Boolean | Default false. Set true after profile completion. |
| paymentVerified | Boolean | Default false. Set true after Remita verification. |
| qrCodeGenerated | Boolean | Default false. Set true after first QR generation. |
| qrCodeToken | String | Unique, sparse. The random 32-byte hex token embedded in QR. |
| qrCodeUsed | Boolean | Default false. Set true when scanned and approved. |
| qrCodeUsedAt | Date | Timestamp of QR usage. |
| examDetails | Object | Optional: examDate, examVenue, examTime. |

### Payment (src/models/Payment.js)

Tracks Remita payment records.

| Field | Type | Details |
|-------|------|---------|
| studentId | ObjectId → Student | Required. |
| orderId | String | Required, unique. Format: "EXAM-{timestamp}-{matricNumber}". |
| rrr | String | Remita Retrieval Reference. Unique, sparse. |
| amount | Number | Required. Fixed at 15,000 (NGN). |
| status | String | Enum: "pending", "processing", "completed", "failed". |
| remitaStatus | String | Raw status code from Remita API. |
| transactionDate | Date | When payment was completed. |
| remitaResponse | Mixed | Full raw response from Remita for debugging. |

### Verification (src/models/Verification.js)

Audit log of every QR scan event.

| Field | Type | Details |
|-------|------|---------|
| studentId | ObjectId → Student | Required. |
| examinerId | ObjectId → User | Required. The examiner who scanned. |
| qrCodeToken | String | Required. The token from the QR code. |
| status | String | Enum: "approved", "denied". Required. |
| examHall | String | Required. Where the scan occurred. |
| notes | String | Optional examiner notes. |
| denialReason | String | Required when status is "denied". |
| verifiedAt | Date | Default: now. |

---

## 6. API Endpoint Reference

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /register | Public | Create account with email/password |
| POST | /login | Public | Sign in with email/password |
| GET | /google | Public | Initiate Google OAuth flow |
| GET | /google/callback | Public | Google OAuth callback |
| GET | /me | Auth | Get current user profile |
| POST | /logout | Auth | Sign out |

### Student (`/api/v1/student`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /register | Student | Complete academic profile + upload photo |
| GET | /profile | Student | Get student profile |
| PUT | /profile | Student | Update profile (optional new photo) |
| GET | /dashboard | Student | Get dashboard data with status |

### Payment (`/api/v1/payment`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /initiate | Student | Generate RRR via Remita |
| POST | /verify/:rrr | Student | Verify payment status |
| GET | /my-payment | Student | Get latest payment record |
| POST | /webhook | Public | Remita payment notification callback |

### QR Code (`/api/v1/qr`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /my-qr | Student | Get/regenerate QR code |
| POST | /verify | Examiner | Verify a scanned QR code |

### Examiner (`/api/v1/examiner`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /scan | Examiner | Scan and decode QR data |
| POST | /approve | Examiner | Approve student entry |
| POST | /deny | Examiner | Deny student entry |
| GET | /history | Examiner | Get verification history |
| GET | /stats | Examiner | Get scan statistics |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /stats | Admin | Dashboard statistics |
| GET | /students | Admin | List all students |
| GET | /students/:id | Admin | Student details |
| PUT | /students/:id/status | Admin | Manual status override |
| GET | /payments | Admin | List all payments |
| GET | /verifications | Admin | List all verifications |
| GET | /users | Admin | List all users |
| PUT | /users/:id/role | Admin | Change user role |

---

## 7. Security Implementation

### Authentication & Authorization

- **JWT-based**: Tokens issued on login with configurable expiry (default 7 days). Sent via `Authorization: Bearer <token>` header.
- **Password Security**: bcrypt with 12 salt rounds. Passwords are excluded from query results by default (`select: false` on the schema).
- **Role-based Access Control**: The `authorize()` middleware restricts routes to specific roles. The `protect()` middleware verifies JWT and loads the user.
- **Google OAuth**: Passport.js strategy with session serialization. Accounts are linked if email already exists.

### Rate Limiting

| Route Category | Window | Max Requests |
|---------------|--------|-------------|
| General API | 15 min | 100 |
| Authentication | 15 min | 5 (skips successful) |
| Payment | 1 hour | 10 |
| QR Scanning | 1 min | 20 |

### Data Protection

- **Helmet**: Sets security HTTP headers (CSP, HSTS, X-Frame-Options, etc.).
- **Mongo Sanitize**: Strips `$` and `.` operators from user input to prevent NoSQL injection.
- **Input Validation**: Zod schemas validate request bodies before processing.
- **QR Encryption**: AES-256-CBC via Node.js `crypto` module. Separate from the JWT signing — the `encrypt()`/`decrypt()` utilities in `src/utils/crypto.js` use `scryptSync` for key derivation.
- **QR Token Integrity**: QR payloads are JWT-signed, so tampering is detectable via signature verification.

---

## 8. Environment Configuration

All configuration is via environment variables. A `.env.example` template is provided:

| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Runtime mode | development / production |
| PORT | Server port | 5000 |
| CLIENT_URL | Frontend origin for CORS | http://localhost:5173 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/exam-verify |
| JWT_SECRET | JWT signing key | (random 64+ char string) |
| JWT_EXPIRE | Token expiry | 7d |
| GOOGLE_CLIENT_ID | Google OAuth client ID | *.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | (from Google Cloud Console) |
| GOOGLE_CALLBACK_URL | OAuth callback URL | http://localhost:5000/api/v1/auth/google/callback |
| CLOUDINARY_CLOUD_NAME | Cloudinary account name | your-cloud-name |
| CLOUDINARY_API_KEY | Cloudinary API key | (from Cloudinary dashboard) |
| CLOUDINARY_API_SECRET | Cloudinary API secret | (from Cloudinary dashboard) |
| REMITA_MERCHANT_ID | Remita merchant ID | 2547916 |
| REMITA_PUBLIC_KEY | Remita public key | (from Remita) |
| REMITA_SECRET_KEY | Remita secret key | (from Remita) |
| REMITA_API_URL | Remita base URL | https://remitademo.net/remita/exapp/api/v1/send/api |
| REMITA_SERVICE_TYPE_ID | Remita service type | 4430731 |
| SESSION_SECRET | Express session secret | (random string) |
| QR_ENCRYPTION_KEY | AES & JWT signing key | (32+ character string) |

---

## 9. Frontend Design Specification — Anthropic-Inspired Design System

The frontend must implement a direct replica of Anthropic's visual design language. This section provides the complete design specification.

### 9.1 Color Palette

**Primary Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Anthracite | #141413 | Primary text, dark backgrounds, nav bars |
| Parchment | #faf9f5 | Page backgrounds, card surfaces |
| Stone | #b0aea5 | Secondary text, borders, disabled states |
| Sand | #e8e6dc | Subtle backgrounds, dividers, table headers |

**Accent Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Terracotta | #d97757 | Primary CTA buttons, active states, links, success indicators |
| Sky | #6a9bcc | Secondary actions, info badges, QR code highlights |
| Sage | #788c5d | Success states, verified badges, completion indicators |

**Semantic Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Error | #c45c4a | Form errors, denial states, failed scans |
| Warning | #d4a03c | Pending states, expiry warnings |
| Success | #788c5d | Verified, approved, completed states |

**CSS Variables:**
```css
:root {
  --color-dark: #141413;
  --color-light: #faf9f5;
  --color-stone: #b0aea5;
  --color-sand: #e8e6dc;
  --color-terracotta: #d97757;
  --color-sky: #6a9bcc;
  --color-sage: #788c5d;
  --color-error: #c45c4a;
  --color-warning: #d4a03c;
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Lora', Georgia, serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(20, 20, 19, 0.06);
  --shadow-md: 0 4px 12px rgba(20, 20, 19, 0.08);
  --shadow-lg: 0 12px 32px rgba(20, 20, 19, 0.12);
}
```

### 9.2 Typography

| Element | Font | Weight | Size | Line Height | Color |
|---------|------|--------|------|-------------|-------|
| Page Title (H1) | Poppins | 600 | 32px | 1.2 | #141413 |
| Section Head (H2) | Poppins | 600 | 24px | 1.3 | #141413 |
| Subsection (H3) | Poppins | 500 | 18px | 1.4 | #141413 |
| Body Text | Lora | 400 | 16px | 1.6 | #141413 |
| Small/Caption | Lora | 400 | 14px | 1.5 | #b0aea5 |
| Button Text | Poppins | 500 | 15px | 1.0 | #faf9f5 (on dark) |
| Input Label | Poppins | 500 | 14px | 1.4 | #141413 |
| Input Value | Lora | 400 | 16px | 1.5 | #141413 |

### 9.3 Component Specifications

**Buttons:**
- Primary: Background `#d97757`, text `#faf9f5`, border-radius 8px, padding 12px 24px. Hover: darken 10%, subtle lift shadow.
- Secondary: Background transparent, border 1.5px `#b0aea5`, text `#141413`. Hover: background `#e8e6dc`.
- Ghost: No background, no border, text `#d97757`. Hover: background `rgba(217, 119, 87, 0.08)`.
- Disabled: Background `#e8e6dc`, text `#b0aea5`, cursor not-allowed.

**Cards:**
- Background `#faf9f5` or `#ffffff`, border 1px `#e8e6dc`, border-radius 12px, padding 24px. Shadow: `var(--shadow-sm)`. Hover (if interactive): shadow transitions to `var(--shadow-md)`.

**Form Inputs:**
- Background `#faf9f5`, border 1.5px `#e8e6dc`, border-radius 8px, padding 12px 16px. Focus: border-color `#d97757`, ring `0 0 0 3px rgba(217, 119, 87, 0.12)`. Error: border-color `#c45c4a`.

**Navigation:**
- Top bar: background `#141413`, height 64px. Logo left, nav links center, user avatar/dropdown right.
- Active link: text `#d97757` with a 2px bottom border.
- Inactive link: text `#b0aea5`. Hover: text `#faf9f5`.
- Mobile: hamburger menu, slide-in drawer from right, background `#141413`.

**Status Badges:**
- Pill shape, border-radius 999px, padding 4px 12px, font-size 13px, font-weight 500.
- Verified/Approved: background `rgba(120, 140, 93, 0.12)`, text `#788c5d`.
- Pending: background `rgba(212, 160, 60, 0.12)`, text `#d4a03c`.
- Failed/Denied: background `rgba(196, 92, 74, 0.12)`, text `#c45c4a`.

**Progress Steps (Registration Flow):**
- Horizontal stepper with circles connected by lines.
- Completed step: circle filled `#788c5d` with check icon, line `#788c5d`.
- Current step: circle filled `#d97757`, pulsing animation.
- Upcoming step: circle outlined `#e8e6dc`, line `#e8e6dc`.

### 9.4 Page Layouts

**Overall Layout:**
- Max content width: 1200px, centered with `margin: 0 auto`.
- Page padding: 24px (mobile), 48px (desktop).
- Background: `#faf9f5` (page), `#ffffff` or `#faf9f5` (cards on top).

**Student Dashboard:**
- Top section: greeting with student name + status progress stepper.
- Grid layout: 2 columns on desktop, 1 on mobile.
- Left column: profile card (passport photo in a rounded square, 120×120, with soft shadow; name, matric, department, faculty, level underneath).
- Right column: stacked cards for payment status, QR code display (if generated), and action buttons.
- QR code card: centered QR image at 280×280px, with a download button below.

**Examiner Scanner Page:**
- Full-viewport camera feed with a centered scanning frame overlay (250×250px square with rounded corners and animated corner brackets).
- Below camera: scan result panel that slides up when a QR is scanned.
- Result panel shows: student passport photo (circular, 80×80), name, matric number, department — with approve/deny action buttons.
- Side panel (desktop) or bottom sheet (mobile): scan history list with success/fail indicators.

**Admin Dashboard:**
- Stat cards row: 4 cards showing key metrics with icons.
- Charts section: bar/line charts for daily scans, payment trends.
- Tables: sortable data tables with pagination for students, payments, and verifications.

### 9.5 Animations & Micro-Interactions

- Page transitions: fade-in with subtle upward slide (200ms, ease-out).
- Card hover: translateY(-2px) + shadow elevation increase (150ms).
- Button press: scale(0.97) for 100ms.
- Scanner frame: animated dashed border that rotates corners.
- QR code reveal: fade-in + scale from 0.8 to 1.0 (300ms, spring easing).
- Status badge transitions: smooth color/background transitions (200ms).
- Skeleton loading: `#e8e6dc` to `#f5f4ef` gradient shimmer animation.

### 9.6 Mock Image Specifications

Since the design aims for a polished look, here are the placeholder images to use during development:

**Student Passport Placeholder:**
- Solid `#e8e6dc` background, 400×400px, centered silhouette icon in `#b0aea5`. Border-radius: 12px for cards, 50% for circular display.

**University Logo Placeholder:**
- 48×48px square, `#141413` background with "EV" lettermark in `#d97757` (Poppins, bold).

**Empty State Illustrations:**
- Use simple geometric compositions: overlapping circles and rounded rectangles in `#e8e6dc` and `#d97757` at 30% opacity.
- "No QR Code Yet": stylized QR grid pattern in `#e8e6dc` with a `#d97757` center accent.
- "No Scans Yet": concentric circles (radar/scan motif) in `#e8e6dc` with animated `#6a9bcc` pulse ring.
- "No Payments": receipt/document shape in `#e8e6dc` with `#d4a03c` checkmark overlay.

---

## 10. Real-Time Features (Socket.io)

The system uses Socket.io for live updates across connected clients:

**Events emitted:**
- `verification:approved` — When an examiner approves a student. Payload includes student name, matric number, exam hall, and timestamp.
- `verification:denied` — When an examiner denies entry. Includes denial reason.
- `payment:completed` — When a payment is confirmed (emitted to admin room).

**Rooms:**
- `examiners` — All connected examiners receive verification events.
- `admins` — All connected admins receive all events.

**Connection flow:**
1. Client connects to Socket.io server (same port as Express, CORS configured for `CLIENT_URL`).
2. Client emits `examiner:join` or `admin:join` to subscribe to the relevant room.
3. Server broadcasts events to rooms when actions occur.

---

## 11. Deployment Strategy

### Recommended: Render (Backend) + Vercel (Frontend)

**Backend (Render):**
1. Push backend code to GitHub.
2. Create a new Web Service on Render, connect the repo.
3. Set build command: `npm install`, start command: `npm start`.
4. Add all environment variables from `.env.example`.
5. Use Render's free MongoDB add-on or connect to MongoDB Atlas.

**Frontend (Vercel):**
1. Push frontend code to GitHub.
2. Import project in Vercel, it auto-detects Vite.
3. Set environment variables (prefixed with `VITE_`).
4. Ensure `VITE_API_URL` points to the Render backend URL.

**Critical deployment notes:**
- Camera/scanner requires HTTPS — both Render and Vercel provide this automatically.
- Add the deployment domain to Google OAuth authorized redirect URIs.
- Update `CLIENT_URL` in backend env to match the Vercel deployment URL.
- Update `GOOGLE_CALLBACK_URL` to use the Render backend URL.

### Alternative: Railway (Backend) + Netlify (Frontend)

Same approach, different hosting providers. Railway offers better cold-start performance for Node.js apps.

### Local Development with Mobile Testing (Ngrok)

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
npm run dev -- --host 0.0.0.0

# Terminal 3: Expose frontend with HTTPS
npx ngrok http 5173
```

This gives a temporary `https://xxxx.ngrok.io` URL with HTTPS for camera access on mobile devices.

---

## 12. Known Issues & Debugging Reference

Based on the prior conversation, these were the identified bugs:

1. **Authentication failures** — "Login failed" error. Likely caused by misconfigured environment variables, incorrect MongoDB connection, or CORS mismatches between frontend and backend origins.

2. **Google OAuth not working** — Requires valid Google Cloud Console credentials, correct callback URL matching the deployment domain, and the OAuth consent screen configured with the correct scopes.

3. **Passport photo upload issues** — The upload depends on Multer (disk storage to `uploads/temp/`) followed by Cloudinary upload. If Cloudinary isn't configured, it falls back to local storage. Ensure the `uploads/temp` directory exists and has write permissions.

4. **Remita RRR verification** — The Remita demo API can be slow or unreliable. The SHA-512 hash computation order matters: `merchantId + serviceTypeId + orderId + amount + apiKey`. Ensure all Remita environment variables are set correctly.

5. **QR code generation** — Depends on payment being verified first. The QR uses JWT signing (not AES encryption directly). The `QR_ENCRYPTION_KEY` must be set and consistent across generation and verification.

6. **Camera scanner on mobile** — Requires HTTPS (no exceptions except localhost). The frontend must use `html5-qrcode` with `facingMode: "environment"` for rear camera. Proper cleanup on component unmount is essential to release the camera.

---

## 13. Frontend Repository Structure (Expected)

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/              ← Axios instance + endpoint functions
│   ├── assets/           ← Static images, icons, fonts
│   ├── components/
│   │   ├── common/       ← Button, Input, Card, Badge, Modal, Spinner
│   │   ├── auth/         ← LoginForm, RegisterForm, GoogleAuthButton
│   │   ├── student/      ← ProfileCard, PaymentForm, QRDisplay, StatusStepper
│   │   ├── examiner/     ← Scanner, ScanResult, ScanHistory, StatsCards
│   │   └── admin/        ← DataTable, StatsGrid, UserManagement
│   ├── context/          ← AuthContext, SocketContext
│   ├── hooks/            ← useAuth, useSocket, useCamera
│   ├── layouts/          ← MainLayout, AuthLayout, DashboardLayout
│   ├── pages/
│   │   ├── auth/         ← Login, Register, AuthCallback
│   │   ├── student/      ← Dashboard, Profile, Payment, QRCode
│   │   ├── examiner/     ← Dashboard, Scanner, History
│   │   └── admin/        ← Dashboard, Students, Payments, Users
│   ├── styles/           ← global.css, variables.css, animations.css
│   ├── utils/            ← formatDate, formatCurrency, constants
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 14. Summary

ExamVerify is a production-oriented system that digitizes exam entry verification for Nigerian universities. The backend is complete and well-structured with JWT authentication, Google OAuth, Remita payment integration, QR code generation, real-time scanning events, and a comprehensive admin panel. The frontend should implement the Anthropic-inspired design system detailed in Section 9, creating a clean, professional, and distinctive user experience that mirrors the refined aesthetic of Anthropic's products — warm parchment backgrounds, terracotta accents, clean typography with Poppins headings and Lora body text, and thoughtful micro-interactions throughout.
