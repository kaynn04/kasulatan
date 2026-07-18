import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Agreement, AgreementParty, AuditLog } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import PrintButton from "./PrintButton";
import styles from "../../workflow.module.css";

type AgreementSummary = Agreement & {
  parties: AgreementParty[];
  auditLogs: AuditLog[];
};

function formatDate(date: Date | null) {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not signed";
  return date.toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    agreement_created: "Agreement created",
    agreement_signed_by_counterparty: "Counterparty signed",
    agreement_signed_by_creator: "Creator signed and finalized",
  };
  return labels[action] ?? action.replaceAll("_", " ");
}

function getParty(agreement: AgreementSummary, role: "CREATOR" | "COUNTERPARTY") {
  return agreement.parties.find((party) => party.role === role);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.documentField}>
      <span className={styles.fieldCaption}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

function PartySection({ party, title }: { party: AgreementParty | undefined; title: string }) {
  if (!party) {
    return (
      <section className={styles.partyCard}>
        <h2 className={styles.documentSectionTitle}>{title}</h2>
        <p className={styles.bodyText}>No party information is available.</p>
      </section>
    );
  }

  return (
    <section className={styles.partyCard}>
      <div className={styles.partyHeader}>
        <div>
          <h2 className={styles.documentSectionTitle}>{title}</h2>
          <p className={styles.partyEmail}>{party.email}</p>
        </div>
        <span className={party.signedAt ? styles.completePill : styles.warningPill}>{party.signedAt ? "Signed" : "Not signed"}</span>
      </div>

      <div className={styles.detailGrid}>
        <Field label="Full name" value={party.fullName} />
        <Field label="Mobile" value={party.mobileNumber ?? "Not provided"} />
        <Field label="Address" value={party.address ?? "Not provided"} />
        <Field label="Signed at" value={formatDateTime(party.signedAt)} />
        <Field label="Read agreement" value={party.confirmedReadAgreement ? "Confirmed" : "Not confirmed"} />
        <Field label="E-signature consent" value={party.consentedToElectronicSignature ? "Consented" : "Not confirmed"} />
      </div>

      {(party.typedSignature || party.signatureImage) && (
        <div className={styles.signatureBlock}>
          <span className={styles.fieldCaption}>Signature</span>
          {party.typedSignature && <p className={styles.typedSignature}>{party.typedSignature}</p>}
          {party.signatureImage && (
            <span className={styles.signaturePaper}>
              <Image src={party.signatureImage} alt={`${party.fullName} signature mark`} width={420} height={120} unoptimized />
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default async function AgreementSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const agreement = await prisma.agreement.findFirst({
    where: {
      id,
      OR: [
        { createdById: session.id },
        { parties: { some: { userId: session.id } } },
      ],
    },
    include: {
      parties: true,
      auditLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!agreement) notFound();

  const creator = getParty(agreement, "CREATOR");
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const isFinalized = agreement.status === "FINALIZED";

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.narrowContainer}>
        <div className={styles.screenActions}>
          <Link href={`/agreements/${agreement.id}`} className={styles.backLink}>
            <span aria-hidden="true">←</span>
            Back to agreement details
          </Link>
          <PrintButton pdfHref={`/agreements/${agreement.id}/summary.pdf`} />
        </div>

        {!isFinalized && (
          <div className={styles.warningBanner}>
            This preview is available for review, but the agreement is not finalized yet. It becomes strongest as a record after both parties sign.
          </div>
        )}

        <article className={styles.document}>
          <header className={styles.documentHeader}>
            <div>
              <p className={styles.documentKicker}>Kasulatan transaction summary</p>
              <h1 className={styles.documentTitle}>{agreement.title}</h1>
              <p className={styles.documentCopy}>A printable summary of the agreement, its parties, signatures, and activity history.</p>
            </div>
            <div className={styles.statusCard}>
              <span>Status</span>
              <strong>{isFinalized ? "Finalized" : agreement.status.replaceAll("_", " ")}</strong>
            </div>
          </header>

          <section className={styles.documentSection}>
            <h2 className={styles.documentSectionTitle}>Agreement details</h2>
            <div className={styles.documentFields}>
              <Field label="Reference number" value={agreement.referenceNumber} />
              <Field label="Agreement type" value={agreement.agreementType} />
              <Field label="Amount" value={`${agreement.currency} ${agreement.amount.toString()}`} />
              <Field label="Due date" value={formatDate(agreement.dueDate)} />
              <Field label="Created" value={formatDate(agreement.createdAt)} />
              <Field label="Finalized" value={isFinalized ? formatDate(agreement.updatedAt) : "Not finalized"} />
            </div>
          </section>

          <section className={styles.documentSection}>
            <h2 className={styles.documentSectionTitle}>Subject matter</h2>
            <p className={styles.bodyText}>{agreement.subjectMatter}</p>
          </section>

          <section className={styles.documentSection}>
            <h2 className={styles.documentSectionTitle}>Payment terms</h2>
            <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.paymentTerms}</p>
          </section>

          <section className={styles.documentSection}>
            <h2 className={styles.documentSectionTitle}>Agreement terms</h2>
            <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.termsText}</p>
          </section>

          <div className={styles.summaryPartyGrid}>
            <PartySection title="Creator" party={creator} />
            <PartySection title="Counterparty" party={counterparty} />
          </div>

          <section className={styles.documentSection}>
            <h2 className={styles.documentSectionTitle}>Audit trail</h2>
            {agreement.auditLogs.length > 0 ? (
              <div className={styles.auditRows}>
                {agreement.auditLogs.map((log) => (
                  <div key={log.id} className={styles.auditRow}>
                    <p className={styles.auditMeta}>{formatDateTime(log.createdAt)}</p>
                    <div>
                      <p className={styles.auditTitle}>{actionLabel(log.action)}</p>
                      <p className={styles.auditMeta}>{log.actorEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className={styles.bodyText}>No activity has been recorded.</p>}
          </section>

          <footer className={styles.documentFooter}>
            Generated from Kasulatan on {formatDateTime(new Date())}. Review this convenience copy together with the full agreement record.
          </footer>
        </article>
      </div>
    </main>
  );
}
