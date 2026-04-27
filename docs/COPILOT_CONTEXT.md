# Copilot Context: Kasulatan

## Project Goal
Build **Kasulatan**, a web app (Philippines-inspired) that helps two people create a digital transaction agreement, capture explicit electronic consent + typed signatures, preserve a clear evidence/audit trail, and collect a **service fee** (users pay the platform).

Product positioning:
- Helps users produce a cleaner record than informal chats (e.g., Messenger).
- **Not legal advice** and does not guarantee court outcomes.

## How I Want To Build It (Learning Style)
I’m learning full-stack fundamentals. I want changes done in **small, explainable increments**.

For each feature, explain the complete chain:
`UI -> request -> server validation -> DB write -> response/redirect -> UI update`

When suggesting code, include:
- what file(s) to change
- why the change is needed
- how FE and BE connect through data shapes (inputs/outputs)

Avoid big refactors unless necessary.

## Tech Stack
- Next.js (App Router) + TypeScript
- Prisma ORM + generated client output to `app/generated/prisma`
- Prisma 7 uses `@prisma/adapter-pg` for Postgres connections
- Hosted PostgreSQL (Prisma Postgres via console.prisma.io)
- Secrets live in `.env` only

## Current State (Implemented)
- Routes exist: `/`, `/dashboard`, `/login`, `/register`, `/agreements`, `/agreements/new`, `/agreements/[id]`
- Agreements list page reads from DB with Prisma and renders a clickable list (`<Link>` to detail page)
- Create Agreement page uses a **server action** with Prisma `$transaction` to:
  - Create `Agreement` record
  - Create two `AgreementParty` rows (CREATOR + COUNTERPARTY) atomically
- Agreement details page reads one agreement by `id` with `include: { parties: true }`
  - Separates parties by role and displays Creator + Counterparty info
- Prisma models: `User`, `Agreement`, `AgreementParty`
- `createdById` and creator party info are currently hardcoded (no authentication yet)
- No form validation yet — server action trusts all input

## Phase 1 MVP (Target)
- User accounts (later)
- Create agreement
- Invite counterparty (later)
- Review + sign (typed name + consent)
- Pay service fee (Stripe later)
- Finalize agreement
- Evidence-friendly record (audit log, timestamps, parties, etc.)

## Completed
1. ✅ Create Agreement + AgreementParty rows in a transaction
2. ✅ Display parties on `/agreements/[id]`
3. ✅ Clickable links on `/agreements` list page
4. ✅ Server-side validation on create form (actions.ts + useActionState + error display)
5. ✅ Back to agreements link on detail page
6. ✅ Counterparty sign flow (`/agreements/[id]/sign`) — checkboxes, typed signature, name match validation
7. ✅ Signature info displayed on detail page (signed status, timestamp, consent)
8. ✅ Conditional sign link (only shows when counterparty hasn't signed)

## Immediate Next Goals (Do These Next)
1. User registration + login (authentication)
2. Replace hardcoded `createdById` and creator info with logged-in user
3. Protect routes — only logged-in users can create agreements
4. Agreement status display on list page (show DRAFT / SIGNED / FINALIZED)

## Constraints / Conventions
- Use database `id` fields as React list keys (avoid `title` keys).
- Keep DB access server-side only (never in client components).
- Keep docs updated in `docs/LESSONS.md` as we learn new concepts.

## Helpful Existing Docs In Repo
- `docs/PROJECT_PLAN.md`
- `docs/DATA_MODEL.md`
- `docs/FEATURE_CREATE_AGREEMENT.md`
- `docs/LESSONS.md`
