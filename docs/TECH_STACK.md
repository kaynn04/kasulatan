# Kasulatan Technical Reference

Last updated: July 18, 2026

This document is the source of truth for the current implementation and engineering conventions. Planned product work and release sequencing belong in `PROJECT_PLAN.md`.

## 1. Current stack

| Area | Current implementation |
|---|---|
| Application | Next.js 16.2.10 App Router |
| UI runtime | React 19.2.4 |
| Language | TypeScript 5 in strict mode |
| Styling | Tailwind CSS 4 plus global CSS and CSS Modules |
| Animation | Motion |
| Server boundary | React Server Components, Server Actions, and Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma 7.7 with `@prisma/adapter-pg` |
| Authentication | Custom database-backed opaque sessions |
| Password hashing | bcryptjs |
| PDF generation | PDFKit |
| Tests | Node test runner with `tsx` |
| Linting | ESLint 9 with the matching Next.js configuration |
| Package manager | npm with a committed lockfile |

No payment provider, email provider, object-storage provider, queue, monitoring provider, or production hosting platform has been selected. These are planned architecture decisions, not current dependencies.

## 2. Repository structure

```text
app/
  agreements/              Agreement list, creation, detail, signing, summary, PDF
  dashboard/               Authenticated overview
  login/, register/        Authentication UI and Server Actions
  logout/                  Logout action
  generated/prisma/        Generated Prisma client; never edit manually
  globals.css              Global theme and Tailwind import
  *.module.css             Route-level CSS Modules
components/                Reusable UI components
docs/
  PROJECT_PLAN.md          Product roadmap, security gates, and priorities
  TECH_STACK.md            Current technical source of truth
lib/
  auth-rate-limit.ts       Database-backed authentication throttling
  form-validation.ts       Shared boundary validation
  prisma.ts                PostgreSQL adapter and Prisma client singleton
  session.ts               Session creation, lookup, and revocation
prisma/
  migrations/              Ordered database history
  schema.prisma            Current database schema
tests/                     Automated tests
types/                     Local declarations for dependencies
```

Keep feature-specific components close to their route when they are used by one workflow. Move code to `components/` only when it is genuinely reusable. Planned domain and data-access code should live in server-only modules under `lib/` rather than in page components.

## 3. Request and data flow

The standard mutation path is:

```text
Client form
  -> Server Action boundary validation
  -> session authentication
  -> resource authorization
  -> domain/state-transition rule
  -> Prisma transaction
  -> audit event
  -> redirect or typed result
  -> refreshed UI
```

Rules:

- Never trust a user ID, role, price, status, or ownership claim from the browser.
- Authenticate and authorize again inside every state-changing server entry point.
- Validate lengths, formats, decoded file size, enumerations, and money on the server.
- Use database transactions for changes that must succeed or fail together.
- Use conditional updates or unique idempotency keys for retried/concurrent actions.
- Return only the fields required by the page.
- Keep secrets and unrestricted Prisma access out of Client Components.

## 4. Current database model

### User

Stores identity, normalized unique email, optional contact/address profile, bcrypt password hash, and timestamps. It relates to created agreements, party records, audit logs, and sessions.

### Agreement

Stores a unique reference, creator, type, title, subject, exact decimal amount, currency, payment terms, due date, agreement terms, lifecycle status, service fee, and timestamps.

Current statuses:

```text
DRAFT
SENT_TO_COUNTERPARTY
VIEWED_BY_COUNTERPARTY
SIGNED_BY_CREATOR
SIGNED_BY_COUNTERPARTY
AWAITING_PAYMENT
FINALIZED
CANCELLED
EXPIRED
```

Not every declared status is used by the present workflow. State transitions must be centralized before expanding the lifecycle.

### AgreementParty

Stores the creator or counterparty snapshot, linked account, contact/address data, typed signature, signature image, consent/read confirmation, signing time, IP, user agent, and timestamps.

There is a unique constraint on `(agreementId, role)`, so an agreement can have only one creator party and one counterparty party. The current `signatureImage` base64 column is temporary; the roadmap moves it to private object storage.

### AuditLog

Stores agreement activity with actor, action, request evidence, optional metadata, and timestamp. Application code should treat records as append-only. Audit data supports an evidence trail but does not itself guarantee legal enforceability.

### Session

Stores only a SHA-256 hash of an opaque random cookie token, its user, creation time, and expiry. The browser cookie is HTTP-only, `SameSite=Lax`, and secure in production.

### AuthRateLimit

Stores counters and reset windows for database-backed login and registration throttling.

The Prisma schema is authoritative. Create a migration for every production schema change; do not edit an already-applied migration.

## 5. Authentication and authorization

Current behavior:

- Passwords must meet server-side length requirements and are hashed with bcrypt.
- A dummy hash comparison reduces account-enumeration timing differences at login.
- Successful login creates a cryptographically random opaque token.
- Only the token hash is stored in PostgreSQL.
- Protected pages and actions resolve the session on the server.
- Agreement access is based on immutable creator/party user IDs.
- Login and registration have per-identity and/or per-IP rate limits.

Known required hardening:

- email ownership verification;
- expiring, single-use password reset;
- session listing, remote revocation, and cleanup;
- verified trusted-proxy behavior for client IPs;
- centralized authorization queries;
- origin checks and Content Security Policy; and
- rate limits for signing, agreement creation, PDFs, and payments.

Never log a password, password hash, raw session token, verification/reset token, signature image, payment credential, or full webhook secret.

## 6. Agreement integrity

Current signing uses a database transaction and conditional status update so concurrent submissions cannot both claim the same transition. Signature data and its audit event commit or roll back together.

Before production, add:

- a canonical immutable agreement version;
- a cryptographic hash of the signable version;
- signatures bound to that version;
- a final PDF generated from the same version; and
- a hash and private object reference for the final PDF.

Never edit signed content in place. A material change should create a new version and require the appropriate parties to review and sign again.

## 7. Files and object storage

Signature images currently live as base64 strings in PostgreSQL. This works for the MVP but increases row size, query cost, backup size, and exposure.

The production design should:

- decode and inspect file contents rather than trust the declared MIME type;
- enforce strict byte and dimension limits;
- store private encrypted objects outside PostgreSQL;
- keep object key, SHA-256 hash, MIME type, size, and scan status in PostgreSQL;
- authorize every read and use short-lived access; and
- define retention and deletion behavior for original and finalized assets.

## 8. Performance conventions

- Paginate agreement collections at the database.
- Apply search, filters, sorting, and counts in SQL through Prisma.
- Use aggregate queries for dashboard statistics.
- Select minimal fields and never include signature payloads in list queries.
- Confirm indexes with measured query plans rather than assumptions.
- Do not wait for email, PDF rendering, or provider APIs inside a database transaction.
- Use an outbox/background worker for reliable external side effects.
- Cache immutable finalized PDFs behind participant authorization.
- Measure web vitals, server-action latency, database latency, error rate, and job failures.

Performance targets and release gates are defined in `PROJECT_PLAN.md`.

## 9. Payments and credits boundary

Payments are not implemented. When the roadmap reaches that phase:

- use provider-hosted checkout;
- store no raw card or wallet credentials;
- accept payment state only from a verified signed webhook;
- keep provider event IDs and mutation idempotency keys unique;
- use an immutable credit ledger as the source of truth;
- reserve/capture/release credits atomically with relevant agreement rules;
- reconcile provider settlements with the internal ledger; and
- keep test and live credentials and webhook endpoints separate.

A mutable balance may be stored as a performance projection, but it must be reproducible from the ledger.

## 10. Security and privacy baseline

Currently configured response protections include:

- framework identification disabled;
- MIME sniffing disabled;
- framing denied;
- strict-origin referrer behavior;
- camera, microphone, and geolocation disabled; and
- one-year HSTS in production.

Production operations must also include:

- TLS with verified database/server identity;
- least-privilege database, storage, provider, and deployment credentials;
- secret rotation and no secrets in Git;
- encrypted automated backups plus tested restoration;
- dependency and secret scanning in continuous integration;
- structured redacted logs, uptime checks, metrics, and alerts;
- a privacy impact assessment, retention schedule, export/deletion process, and breach procedure; and
- qualified Philippine privacy, electronic-transaction, consumer, accounting, and tax review.

Security and legal compliance are ongoing processes, not a one-time checklist or product claim.

## 11. Styling and UI conventions

- Tailwind is available through `app/globals.css` and the PostCSS plugin.
- Existing screens mainly use global theme variables and CSS Modules.
- Use the existing light/dark theme variables instead of hard-coded surface and text colors.
- Keep signature drawing and previews on a consistent light canvas so dark-mode inversion cannot hide ink.
- Preserve visible focus states, keyboard access, semantic labels, readable contrast, and responsive layouts.
- Avoid decorative patterns that compete with agreement content or make the application resemble a generic generated template.

## 12. Environment configuration

Local secrets belong in `.env`, which is ignored by Git. Never commit real connection strings, session values, provider credentials, or signing secrets.

Current required variable:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.

Document each new environment variable here by name and purpose, but never include its value. Validate required production variables at startup as integrations are added.

## 13. Development commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run the standard verification suite:

```bash
npm run check
```

Create and apply a development migration after changing the schema:

```bash
npx prisma migrate dev --name descriptive_name
```

Apply committed migrations in staging or production:

```bash
npx prisma migrate deploy
```

Build the production application:

```bash
npm run build
```

Check production dependency advisories:

```bash
npm audit --omit=dev
```

Do not run destructive migration or reset commands against shared or production data.

## 14. Testing expectations

The current automated suite covers focused validation rules. It must grow to include:

- registration, verification, login, logout, recovery, and session revocation;
- cross-account list/detail/sign/PDF authorization;
- agreement creation rollback and lifecycle transitions;
- creator/counterparty signing races and repeated submissions;
- signature upload validation and private object access;
- immutable version and final PDF hash behavior;
- payment webhook signature, duplication, ordering, and reconciliation;
- credit concurrency, reservation, release, capture, and refund; and
- the full two-user workflow against a disposable PostgreSQL database.

Every bug involving authorization, integrity, money, or a race condition should receive a regression test.

## 15. Documentation rule

Keep only these two files in `docs/`:

- `PROJECT_PLAN.md` for what and when to build;
- `TECH_STACK.md` for how the application currently works.

Do not create dated session notes, duplicate setup guides, standalone feature notes, or assistant-specific context files. Put durable product decisions in the plan, durable implementation knowledge here, and temporary work details in issues or commit messages.
