# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

---

### 2026-04-29 — Security Hardening & Account Management

#### Added
- Server-side session authentication with encrypted httpOnly cookies (iron-session)
- Middleware enforcing authentication on all routes except `/login` and `/api/auth/*`
- Ownership verification on all mutation endpoints — users can only modify their own data
- Rate limiting on login (5 attempts / 15 min) and registration (3 attempts / hr) per IP
- Logout endpoint that destroys the server-side session cookie
- `/api/auth/me` endpoint for client session hydration without localStorage
- Account deletion — permanently removes account and all associated data (password-confirmed)
- Privacy policy page at `/privacy`

#### Changed
- Auth state now stored in a signed, encrypted server cookie instead of localStorage
- Settings page updated: accurate data storage description, link to privacy policy, delete account UI
- All API routes scoped to the authenticated user; catalog routes protected with `requireAuth`

---

### 2026-04-29 — Auth, Encryption & Session Polish

#### Added
- User registration and login with per-user data isolation
- AES-256-GCM server-side encryption for sensitive entry fields
- 7-day session expiry with automatic token invalidation
- Stopwatch timer in nav bar for timing incidents and caregiver handoffs

#### Changed
- Removed username label from header user icon for a cleaner look

#### Fixed
- `pdf-generator` `fontStyle` type error that was breaking Vercel builds
- Edit/delete icons missing on entries without notes
- Wrapped home page in Suspense boundary to fix `useSearchParams` error

---

### 2025-12-12 — PDF Improvements & Security

#### Added
- ABC Data Sheet PDF redesigned to match on-screen component layout

#### Fixed
- Remaining npm audit security vulnerabilities
- React Server Components CVE (`VU-71ITLJ`) patched via dependency update
- PDF generation bug; Notes section display redesigned in ABC Data Sheet

---

### 2025-11-06 — Food Tracking, Edit & API Consolidation

#### Added
- Food event tracking with database persistence alongside existing poop tracking
- Edit functionality — edit icon added next to the delete button on each entry

#### Changed
- All home page data now fetched through a single consolidated `/api/entries` endpoint
- Removed severity/intensity field from database, UI, and API

#### Fixed
- PATCH endpoint for incident updates
- Entries API loading failure on home page
- Removed iOS status bar simulation component

---

### 2025-11-04 — Delete Functionality

#### Added
- Delete incident functionality with confirmation dialog

---

### 2025-11-03 — Stability Fixes

#### Fixed
- Calendar date offset causing incidents to appear on wrong days
- Improved error handling and removed undefined values in incident creation
- Home page incidents now correctly persisted to PostgreSQL

---

### 2025-10-30 — PDF Export

#### Added
- Report printing functionality with PDF export
- Print-friendly views for incident data

---

### 2025-10-23 — Multi-Select Behaviors & Consequences

#### Added
- Multi-select support for behavior types and consequences in the incident form

#### Changed
- Removed auto-scroll after behavior type selection

#### Fixed
- MultiSelect component now correctly allows multiple simultaneous selections
- Build errors in incident API route and multi-select component

---

### 2025-10-17 — Mobile Foundation, Neon/Prisma, Calendar

#### Added
- Mobile-first iOS design system across entire application
- Reusable `MobileLayout` component with header and bottom tab navigation
- Swipe gesture navigation between tabs (`react-swipeable`)
- Mobile-friendly date/time and duration pickers
- Multi-level entry selector revealing Incident and Poop logging options
- Consequence field with custom free-text input option
- Auto-scroll to Consequence section after Behavior Type selection
- Calendar page: month grid view with incident day-highlighting and month navigation

#### Changed
- Set up Neon PostgreSQL + Prisma ORM with production build configuration
- Incident form and child select converted to use API routes
- All pages converted to mobile-only design with unified stone/emerald visual system
- Navigation centralised to fixed bottom tab bar

#### Fixed
- TypeScript error in catalogs API route
- Calendar page was showing a static list instead of a month grid

---

### 2025-10-16 — Initial Commit

- Project scaffolded from `create-next-app`
- Behavior tracking app foundation with mobile support
