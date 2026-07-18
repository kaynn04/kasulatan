# Kasulatan Product and Delivery Plan

Last updated: July 18, 2026

This is the living guide for deciding what Kasulatan should build next. Update it when a milestone, product rule, or release gate changes. The current implementation and engineering conventions belong in `TECH_STACK.md`.

## 1. Product direction

Kasulatan helps people in the Philippines create a clear record of a private transaction, review the same agreement, provide electronic consent and signatures, and retain an evidence trail.

The initial users are people handling informal loans, item sales or swaps, and small service agreements who need a better record than a chat conversation.

Kasulatan is a record-keeping and workflow product. It does not provide legal advice and must not promise that an agreement will be enforceable or determine the outcome of a dispute.

## 2. Business model

Use a freemium SaaS model with prepaid **Kasulatan credits**. Do not place advertisements inside dashboards, agreement pages, signing flows, PDFs, or payment flows.

Credits must be:

- bought by the agreement creator; counterparties sign for free;
- usable only for Kasulatan services;
- non-transferable and not redeemable for cash;
- priced and explained before they are consumed;
- backed by an immutable transaction history; and
- automatically released or restored after eligible technical failures.

Use “credits” in the product instead of “tokens” to avoid suggesting cryptocurrency or transferable stored value.

The proposed charging lifecycle is:

```text
Create and edit a draft for free
        -> send for signature
        -> reserve one credit
        -> first valid signature captures the credit
        -> expiry with no signature releases the credit
        -> final PDF and future downloads have no extra charge
```

This is a product hypothesis until beta usage and actual cost per finalized agreement are measured. Do not implement payments before the security, integrity, performance, and beta gates below pass.

## 3. Product principles

Every decision should protect these priorities, in order:

1. **Authorization:** only an agreement's participants can access it.
2. **Evidence integrity:** signed content and its audit trail cannot silently change.
3. **Privacy:** collect only necessary data and control its access, retention, export, and deletion.
4. **Reliability:** retries and double-clicks do not duplicate signatures, charges, or events.
5. **Speed:** common actions remain responsive as the database grows.
6. **Clarity:** users know the agreement state, the next action, and any credit cost.
7. **Accessibility:** core workflows work on mobile, keyboard, assistive technology, and slow networks.

## 4. Current baseline

Already implemented:

- registration, login, logout, protected pages, and hashed opaque sessions;
- bcrypt password hashing and bounded server-side validation;
- database-backed authentication rate limits;
- creator and counterparty agreement records;
- atomic agreement creation and signing transitions;
- server-side participant authorization;
- typed and drawn/uploaded signatures;
- agreement audit events with actor and request evidence;
- agreement summary, print view, and downloadable PDF;
- light and dark themes; and
- security headers, strict TypeScript, linting, and focused validation tests.

Not production-ready yet:

- email verification and password recovery;
- trusted production proxy/IP configuration;
- centralized agreement authorization and minimal data-transfer objects;
- immutable agreement versions and final document hashes;
- private object storage for signature assets;
- privacy operations and a documented retention schedule;
- complete integration and end-to-end tests;
- pagination and database-side dashboard aggregation;
- production monitoring, alerting, backup restoration, and incident response;
- asynchronous email and PDF processing; and
- payment, credit ledger, webhook, refund, and reconciliation systems.

## 5. Delivery roadmap

The estimates assume one primary developer and are planning ranges, not deadlines.

### Phase 0 — Rules and environments (about 1 week)

Goal: establish decisions that later code must enforce.

- Keep this plan and `TECH_STACK.md` current.
- Create a personal-data inventory: field, purpose, legal basis, location, access, and retention.
- Document allowed agreement state transitions.
- Define credit reservation, capture, release, refund, and expiry policies.
- Threat-model account takeover, cross-account access, leaked signatures, document modification, forged webhooks, and duplicate charges.
- Create separate development, staging, and production environments with separate databases, storage, credentials, and payment modes.
- Decide performance objectives and the events needed to measure the user funnel.

Exit gate:

- Data-retention and credit policies are written.
- Staging is isolated from production.
- Secrets are not committed and each environment uses independent credentials.

### Phase 1 — Identity and authorization (about 2–3 weeks)

Goal: make account and agreement access safe enough for an external beta.

- Add email verification using hashed, expiring, single-use tokens.
- Add rate-limited password recovery and revoke all user sessions after a reset.
- Let users inspect and revoke active sessions.
- Rotate sessions after sensitive authentication changes.
- Configure and verify the trusted proxy boundary before relying on forwarded IP headers.
- Add origin checks for state-changing requests.
- Centralize participant authorization in a server-only data-access/service layer.
- Return minimal DTOs rather than full database records.
- Rate-limit agreement creation, invitations, signing, PDF creation, password reset, and checkout creation.
- Add Content Security Policy in report-only mode, resolve violations, and then enforce it.
- Schedule cleanup of expired sessions and rate-limit rows.

Exit gate:

- Automated tests prove that unrelated users cannot list, read, sign, alter, or download an agreement.
- Verification and recovery tokens cannot be reused.
- Logs contain no passwords, raw session tokens, raw signatures, or unnecessary personal data.

### Phase 2 — Document integrity and privacy (about 2–4 weeks)

Goal: preserve exactly what people reviewed and signed.

- Add immutable `AgreementVersion` records.
- Produce a canonical snapshot before an agreement becomes signable.
- Compute and store a SHA-256 hash for every signable version.
- Bind signatures and consent to a specific version.
- Generate the final PDF from that same version and store its hash.
- Keep audit records append-only through application permissions.
- Move signatures from base64 database columns to private encrypted object storage.
- Decode and inspect uploaded files; record object key, MIME type, byte size, hash, and scan status.
- Use short-lived authorized asset access; never expose public signature URLs.
- Record the privacy notice and electronic-signature consent version accepted by each user.
- Implement account data export and a reviewed deletion/anonymization workflow.
- Define encrypted backup retention and complete a restoration drill.
- Complete a Philippine privacy impact assessment and qualified legal review before making compliance or enforceability claims.

Exit gate:

- Any change to a signed snapshot or final PDF is detectable.
- Private signature assets cannot be accessed without participant authorization.
- Retention, access, export, deletion, and breach-response procedures are documented and tested.

### Phase 3 — Performance and reliability (about 2–3 weeks)

Goal: keep the application fast and predictable as usage grows.

- Replace unbounded agreement queries with database pagination, filtering, sorting, and search.
- Calculate dashboard totals with database aggregates and fetch only the recent rows displayed.
- Select only fields needed by each page.
- Inspect real query plans and add indexes based on measured access patterns.
- Add an outbox and background worker for emails and other external side effects.
- Generate finalized PDFs in the background or cache them as immutable private objects.
- Add request correlation, structured server errors, database latency, web vitals, uptime checks, and alerts.
- Prevent duplicate submissions and provide safe retry behavior.
- Add loading states, useful failure messages, mobile testing, keyboard navigation, focus states, and contrast checks.

Initial service objectives:

- Largest Contentful Paint p75 below 2.5 seconds.
- Interaction to Next Paint p75 below 200 milliseconds.
- Cumulative Layout Shift below 0.1.
- Normal server actions p95 below 500 milliseconds.
- Signing transactions p95 below 1 second.
- Application error rate below 1%.
- No unbounded list query or request-time delivery dependency.

Exit gate:

- Objectives pass with production-like data and expected concurrency in staging.
- Retried requests cannot create duplicate signatures or audit events.
- Alerts detect elevated errors, latency, database saturation, and failed background jobs.

### Phase 4 — Private beta (about 2 weeks)

Goal: validate usefulness and trust before charging users.

- Invite approximately 20–50 users with free beta access.
- Measure agreement creation, sending, viewing, signing, finalization, repeat use, failure, and support rates.
- Measure database, storage, email, PDF, and support cost per finalized agreement.
- Interview creators and counterparties about clarity and trust.
- Run two-user end-to-end, authorization, signing-race, rollback, PDF-access, slow-network, and backup-recovery tests.
- Prepare incident, support, privacy, terms, and status communications.

Exit gate:

- Users complete the signing flow without developer assistance.
- Repeat usage indicates value beyond initial testing.
- Unit economics support the proposed credit price.
- No unresolved critical security, privacy, integrity, accessibility, or data-loss issue remains.

### Phase 5 — Payments and credits (about 3–4 weeks)

Goal: introduce auditable monetization without storing card details.

- Select a payment provider that supports Philippine customers, settlement, receipts, refunds, and reliable signed webhooks.
- Use provider-hosted checkout; never collect raw card or wallet credentials.
- Add `Payment`, `WebhookEvent`, `CreditLedgerEntry`, `CreditReservation`, and `Refund` records.
- Treat the immutable ledger as the source of truth; a cached balance is only a projection.
- Verify webhook signatures against the raw request body.
- Make provider event IDs and mutation idempotency keys unique.
- Verify amount, currency, product, environment, and customer before granting credits.
- Handle duplicate and out-of-order webhooks.
- Prevent negative balances and atomically connect credit changes to agreement actions.
- Display balance, cost, reservation state, transaction history, receipts, and refund state.
- Reconcile provider transactions against the internal ledger and alert on differences.
- Add administrative adjustments with reason, actor, and audit evidence.
- Review tax, invoicing, accounting, refund, expiry, and consumer-protection requirements with qualified professionals.

Exit gate:

- Duplicate webhook and concurrent-spend tests cannot grant or consume credits twice.
- Ledger totals reconcile with provider settlements.
- A payment failure never loses agreement data.
- A Kasulatan failure never silently consumes a credit.

### Phase 6 — Gradual paid launch (about 1–2 weeks)

Goal: release safely and learn before scaling.

- Roll out payments to a small percentage of creators first.
- Preserve explicit beta entitlements and existing finalized agreements.
- Publish clear pricing, credit, refund, privacy, and support policies.
- Set database, storage, email, PDF, and payment cost alerts.
- Monitor conversion, repeat purchase, signing completion, refunds, support load, latency, and error rates.
- Pause the rollout automatically or operationally when a release gate regresses.

## 6. Planned data model additions

The exact Prisma design should be reviewed when each phase begins.

- `EmailVerificationToken`: hashed token, user, expiry, consumption time.
- `PasswordResetToken`: hashed token, user, expiry, consumption time.
- `AgreementVersion`: agreement, version, canonical snapshot or object key, hash, creator, timestamp.
- `SignatureAsset`: private object key, hash, MIME type, byte size, scan status.
- `Payment`: provider references, amount, currency, credit quantity, status, timestamps.
- `WebhookEvent`: unique provider event, payload hash, processing status, error, timestamps.
- `CreditLedgerEntry`: signed amount, type, user, agreement/payment relation, idempotency key.
- `CreditReservation`: agreement, amount, state, expiry, capture/release timestamps.
- `Refund`: provider and internal references, amount, reason, state.
- `OutboxEvent`: event type, payload reference, attempts, next attempt, completion state.
- `PrivacyRequest`: export/deletion request, verification, state, resolution evidence.

## 7. Immediate implementation queue

Complete these in order:

1. Create the data inventory, retention schedule, threat model, and state-transition rules.
2. Establish and verify an isolated staging environment and migration procedure.
3. Implement email verification and password recovery.
4. Introduce the server-only agreement data-access/service layer.
5. Add integration and two-user end-to-end test infrastructure.
6. Move signature assets to private object storage with content validation and hashes.
7. Add immutable agreement versions and final-document hashing.
8. Add structured observability, alerts, encrypted backups, and a restore runbook.
9. Replace unbounded agreement/dashboard reads with pagination and aggregates.
10. Add the outbox/background processing boundary for email and PDFs.

Payments begin only after these items and their relevant release gates pass.

## 8. Definition of done

A feature is complete only when:

- authorization and abuse cases are considered;
- input is validated at the server boundary;
- related database mutations are atomic where needed;
- retries are safe;
- sensitive data is minimized in responses and logs;
- success, empty, loading, and failure states are usable;
- automated tests cover the important success and failure paths;
- relevant metrics and alerts exist;
- migrations and rollback/recovery implications are understood; and
- this plan or `TECH_STACK.md` is updated when the product or architecture changes.
