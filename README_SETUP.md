# Kasulatan - Setup & UI Development Guide

A digital agreement and transaction record platform for the Philippines. Helps two people create clear digital transaction agreements, capture electronic consent, and store a stronger evidence trail for private transactions.

## Project Overview

**What it does:**
- Users register and log in
- User A creates an agreement with User B's email
- User B reviews and electronically signs
- User A reviews and signs
- Agreement is finalized with full audit trail

**What it stores:**
- Agreement details (type, amount, terms, etc.)
- Party information (creator + counterparty)
- Signature data (typed name, timestamp, consent)
- Full audit log (creation, signing events)

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 (already installed)
- **Backend:** Next.js Server Actions + TypeScript
- **Database:** PostgreSQL (Prisma Postgres via console.prisma.io)
- **ORM:** Prisma 7 with PrismaAdapter-PG
- **Auth:** Cookie-based sessions (custom implementation)
- **Password Hashing:** bcryptjs

## Prerequisites

Before starting, check you have:

```powershell
node -v       # Should be v18+
npm -v        # Should be v9+
git --version # Should be present
```

## Setup (First Time)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the root with:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
```

Get your PostgreSQL connection string from [console.prisma.io](https://console.prisma.io).

### 3. Database setup

```bash
npx prisma migrate deploy
npx prisma generate
```

This applies all migrations and generates the TypeScript client.

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  ├── page.tsx              # Landing page
  ├── login/                # Login flow
  │   ├── page.tsx
  │   ├── LoginForm.tsx     # ← Style this
  │   └── actions.ts
  ├── register/             # Registration flow
  │   ├── page.tsx
  │   ├── RegisterForm.tsx  # ← Style this
  │   └── actions.ts
  ├── dashboard/            # User dashboard (empty, design as needed)
  ├── agreements/           # Agreement list
  │   ├── page.tsx          # ← Style list layout
  │   ├── [id]/             # Agreement detail
  │   │   ├── page.tsx      # ← Style detail view
  │   │   ├── sign-counter/ # Counterparty signing
  │   │   │   ├── page.tsx
  │   │   │   └── SignForm.tsx  # ← Style form
  │   │   └── sign-creator/ # Creator signing
  │   │       ├── page.tsx
  │   │       └── SignCreatorForm.tsx  # ← Style form
  │   └── new/              # Create agreement
  │       ├── page.tsx
  │       └── CreateAgreementForm.tsx  # ← Style form
  ├── logout/
  └── generated/prisma/     # Generated Prisma client (do not edit)

lib/
  ├── session.ts            # Session helper (do not edit)
  └── prisma.ts             # Prisma client (do not edit)

prisma/
  ├── schema.prisma         # Database schema (do not edit unless backend approves)
  └── migrations/           # Migration history (do not edit)

components/
  ├── Logout.tsx            # ← Style this button
  ├── PageIntro.tsx         # ← Style header
  └── ...

docs/
  ├── PROJECT_PLAN.md       # Feature roadmap
  ├── DATA_MODEL.md         # Database design
  ├── LESSONS.md            # Learning notes
  └── COPILOT_CONTEXT.md    # Development notes
```

## Current Features (Backend Complete)

✅ User registration + login (with password hashing)  
✅ Session-based authentication (cookie-secure, 7-day expiry)  
✅ Create agreement with counterparty email  
✅ Auto-fill counterparty name/mobile from registered user  
✅ Role-based access control (creator vs counterparty)  
✅ Electronic signing flow (typed signature + consent)  
✅ Agreement status tracking (DRAFT → SIGNED → FINALIZED)  
✅ Audit logging (creation, signing events)  
✅ Separate list views (my agreements vs where I'm counterparty)

## What Needs UI/UX Work

**Current state:** All functionality works, but pages look plain/default.

**High Priority (Core User Experience):**
1. **Login & Register Pages** — styled forms, proper spacing, branding
2. **Navigation Bar** — header with user name, logout button
3. **Agreement List** — cards or table view with status colors
4. **Agreement Detail** — clean layout of agreement info + party details
5. **Status Badges** — DRAFT (yellow), SIGNED (blue), FINALIZED (green)

**Medium Priority:**
6. **Forms Styling** — all inputs/buttons use consistent Tailwind styles
7. **Error Messages** — better visual hierarchy for validation errors
8. **Signing Pages** — clearer layout for signature capture
9. **Dashboard** — show user stats (agreements created, pending signatures)

**Polish:**
10. **Mobile Responsiveness** — all pages work on mobile
11. **Loading States** — spinners while saving
12. **Empty States** — "No agreements yet" messaging

## How to Style

We use **Tailwind CSS 4** (already configured).

### Example: Styling a button

Instead of:
```tsx
<button type="submit">Login</button>
```

Use:
```tsx
<button 
  type="submit" 
  className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700"
>
  Login
</button>
```

### Common Tailwind patterns

**Containers & spacing:**
```tsx
<div className="max-w-md mx-auto p-6 space-y-4">
```

**Forms:**
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
```

**Buttons:**
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
  Save
</button>
```

**Cards:**
```tsx
<div className="bg-white rounded-lg shadow p-6 border border-gray-200">
```

**Status badges:**
```tsx
<span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  DRAFT
</span>
```

## Testing the App

### Create test accounts

1. Go to `/register`
2. Create Account A: 
   - Email: `userA@test.com`
   - Password: `password123`
   - Mobile: `09101234567`
3. Create Account B:
   - Email: `userB@test.com`
   - Password: `password123`
   - Mobile: `09209876543`

### Full end-to-end flow

1. Log in as User A
2. Go to `/agreements/new`
3. Fill form:
   - Title: "Loan Agreement"
   - Type: "LOAN"
   - Amount: 5000
   - Counterparty Email: `userB@test.com`
4. Submit
5. Log out, log in as User B
6. Go to `/agreements`
7. Click agreement → click "Start signing"
8. Sign (type your name)
9. Log out, log in as User A
10. Go to agreements detail page
11. Click "Start signing" in creator section
12. Sign
13. Agreement shows FINALIZED ✅

## Development Workflow

### Running the app

```bash
npm run dev
```

Dev server hot-reloads on file changes.

### Database browser

View/edit data directly:

```bash
npx prisma studio
```

Opens [http://localhost:5555](http://localhost:5555). Great for testing!

### Git workflow

```bash
git add .
git commit -m "Style login and register pages"
git push
```

## Key Files to Know

**DO EDIT:**
- All files in `app/` with `*.tsx` (React components)
- `app/globals.css` (global styles)
- Any component files

**DON'T EDIT:**
- `prisma/schema.prisma` (database schema — backend manages)
- `app/generated/prisma/` (auto-generated — regenerate with `npx prisma generate`)
- `.next/` or `node_modules/` (build artifacts)

## Common Tasks

### Change a page layout

Edit the relevant `page.tsx` file. Example: `/app/login/page.tsx`

### Style a form

The form component is separate. Example: `/app/login/LoginForm.tsx`

### Add a new component

Create in `components/` folder and import where needed.

### Test database

```bash
npx prisma studio
```

See all tables, create test data, etc.

## Need Help?

- **TypeScript/React questions?** See `docs/LESSONS.md`
- **How data flows?** See `docs/DATA_MODEL.md`
- **Feature roadmap?** See `docs/PROJECT_PLAN.md`

## Deployment

When ready:

```bash
npm run build
npm run start
```

Or deploy to Vercel (recommended for Next.js):

```bash
npm install -g vercel
vercel
```

## Questions?

Ask the backend dev (Adrian) about:
- Database schema changes
- Authentication logic
- New API requirements

Have fun styling! 🎨
