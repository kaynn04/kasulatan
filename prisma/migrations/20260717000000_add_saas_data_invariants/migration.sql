-- One agreement has at most one record per party role. The application already
-- creates one creator and one counterparty; this makes that invariant durable.
CREATE UNIQUE INDEX "AgreementParty_agreementId_role_key"
ON "AgreementParty"("agreementId", "role");

-- Index the application's principal authorization and list-query paths.
CREATE INDEX "Agreement_createdById_updatedAt_idx"
ON "Agreement"("createdById", "updatedAt");

CREATE INDEX "Agreement_status_updatedAt_idx"
ON "Agreement"("status", "updatedAt");

CREATE INDEX "AgreementParty_userId_updatedAt_idx"
ON "AgreementParty"("userId", "updatedAt");

CREATE INDEX "AgreementParty_email_idx"
ON "AgreementParty"("email");

CREATE INDEX "AuditLog_agreementId_createdAt_idx"
ON "AuditLog"("agreementId", "createdAt");

CREATE INDEX "AuditLog_actorUserId_createdAt_idx"
ON "AuditLog"("actorUserId", "createdAt");
