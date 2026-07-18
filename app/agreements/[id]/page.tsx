import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Agreement, AgreementParty, AuditLog } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import styles from "../workflow.module.css";

type AgreementWithDetails = Agreement & {
  parties: AgreementParty[];
  auditLogs: AuditLog[];
};

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Waiting for counterparty",
    SENT_TO_COUNTERPARTY: "Sent to counterparty",
    VIEWED_BY_COUNTERPARTY: "Viewed by counterparty",
    SIGNED_BY_COUNTERPARTY: "Waiting for creator",
    SIGNED_BY_CREATOR: "Waiting for counterparty",
    AWAITING_PAYMENT: "Payment pending",
    FINALIZED: "Completed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };

  return labels[status] ?? status;
}

function formatDate(date: Date | null) {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not signed";
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(agreement: AgreementWithDetails) {
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: agreement.currency,
      maximumFractionDigits: 2,
    }).format(Number(agreement.amount));
  } catch {
    return `${agreement.currency} ${agreement.amount.toString()}`;
  }
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    agreement_created: "Agreement created",
    agreement_signed_by_counterparty: "Counterparty signed",
    agreement_signed_by_creator: "Creator signed",
  };
  return labels[action] ?? action.replaceAll("_", " ");
}

function getParty(agreement: AgreementWithDetails, role: "CREATOR" | "COUNTERPARTY") {
  return agreement.parties.find((party) => party.role === role);
}

function getNextAction(agreement: AgreementWithDetails, userId: string) {
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const creator = getParty(agreement, "CREATOR");
  const isCreator = agreement.createdById === userId;
  const isCounterparty = counterparty?.userId === userId;

  if (isCounterparty && agreement.status === "DRAFT" && !counterparty?.signedAt) {
    return {
      href: `/agreements/${agreement.id}/sign-counter`,
      label: "Review and sign",
      helper: "You are the counterparty. Check the full record before adding your signature.",
    };
  }

  if (isCreator && agreement.status === "SIGNED_BY_COUNTERPARTY" && !creator?.signedAt) {
    return {
      href: `/agreements/${agreement.id}/sign-creator`,
      label: "Finalize with signature",
      helper: "The counterparty has signed. Your signature will finalize this record.",
    };
  }

  if (agreement.status === "FINALIZED") {
    return {
      href: `/agreements/${agreement.id}/summary`,
      label: "Open printable summary",
      helper: "Both signatures are recorded. Save or print a summary for your records.",
    };
  }

  return {
    href: "/agreements",
    label: "Back to agreements",
    helper: "No signature action is available for your account at this stage.",
  };
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

function PartyCard({ party, title }: { party: AgreementParty | undefined; title: string }) {
  if (!party) {
    return (
      <section className={styles.partyCard}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.bodyText}>No party information is available.</p>
      </section>
    );
  }

  return (
    <section className={styles.partyCard}>
      <div className={styles.partyHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.partyEmail}>{party.email}</p>
        </div>
        <span className={party.signedAt ? styles.completePill : styles.warningPill}>
          {party.signedAt ? "Signed" : "Not signed"}
        </span>
      </div>

      <div className={styles.detailGrid}>
        <DetailItem label="Name" value={party.fullName} />
        <DetailItem label="Mobile" value={party.mobileNumber ?? "Not provided"} />
        <DetailItem label="Address" value={party.address ?? "Not provided"} />
        <DetailItem label="Signed at" value={formatDateTime(party.signedAt)} />
        <DetailItem label="Read agreement" value={party.confirmedReadAgreement ? "Confirmed" : "Not confirmed"} />
        <DetailItem label="E-signature consent" value={party.consentedToElectronicSignature ? "Consented" : "Not yet"} />
      </div>

      {party.typedSignature && (
        <div className={styles.signatureBlock}>
          <span className={styles.detailLabel}>Typed signature</span>
          <p className={styles.typedSignature}>{party.typedSignature}</p>
        </div>
      )}

      {party.signatureImage && (
        <div className={styles.signaturePaper}>
          <span className={styles.detailLabel}>Signature mark</span>
          <Image src={party.signatureImage} alt={`${party.fullName} signature`} width={420} height={120} unoptimized />
        </div>
      )}
    </section>
  );
}

export default async function AgreementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!agreement) notFound();

  const creator = getParty(agreement, "CREATOR");
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const nextAction = getNextAction(agreement, session.id);
  const isFinalized = agreement.status === "FINALIZED";

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.container}>
        <Link href="/agreements" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Back to agreements
        </Link>

        <section className={styles.heroCard}>
          <div>
            <div className={styles.pillRow}>
              <span className={styles.pill}>{agreement.agreementType}</span>
              <span className={isFinalized ? styles.completePill : styles.warningPill}>{formatStatus(agreement.status)}</span>
            </div>
            <h1 className={styles.title}>{agreement.title}</h1>
            <p className={styles.lede}>{agreement.subjectMatter}</p>
          </div>

          <aside className={styles.darkCard}>
            <h2>Next action</h2>
            <p>{nextAction.helper}</p>
            <Link href={nextAction.href} className={styles.goldAction}>{nextAction.label}</Link>
          </aside>

          <div className={styles.metaStrip}>
            <DetailItem label="Reference" value={agreement.referenceNumber} />
            <DetailItem label="Amount" value={formatAmount(agreement)} />
            <DetailItem label="Due date" value={formatDate(agreement.dueDate)} />
            <DetailItem label="Created" value={formatDate(agreement.createdAt)} />
            <DetailItem label="Updated" value={formatDate(agreement.updatedAt)} />
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.stack}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Payment terms</h2>
              <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.paymentTerms}</p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Agreement terms</h2>
              <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.termsText}</p>
            </section>

            <div className={styles.partyGrid}>
              <PartyCard title="Creator" party={creator} />
              <PartyCard title="Counterparty" party={counterparty} />
            </div>
          </div>

          <aside className={`${styles.asideStack} ${styles.stickyAside}`}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Signing progress</h2>
              <div className={styles.progressList}>
                {[
                  { label: "Counterparty reviews and signs", done: Boolean(counterparty?.signedAt) },
                  { label: "Creator reviews and signs", done: Boolean(creator?.signedAt) },
                  { label: "Agreement is finalized", done: isFinalized },
                ].map((step, index) => (
                  <div key={step.label} className={styles.progressItem}>
                    <span className={styles.progressMark} data-complete={step.done}>
                      {step.done ? (
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 4L6.5 11 3 7.5" />
                        </svg>
                      ) : index + 1}
                    </span>
                    <p>{step.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Activity log</h2>
              {agreement.auditLogs.length > 0 ? (
                <div className={styles.auditList}>
                  {agreement.auditLogs.map((log) => (
                    <div key={log.id} className={styles.auditItem}>
                      <p className={styles.auditTitle}>{actionLabel(log.action)}</p>
                      <p className={styles.auditMeta}>{log.actorEmail}</p>
                      <p className={styles.auditDate}>{formatDateTime(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : <p className={styles.bodyText}>No activity has been recorded yet.</p>}
            </section>

            <section className={styles.warningCard}>
              <h2>Review carefully</h2>
              <p>Before signing, confirm that the names, amount, dates, payment terms, and responsibilities match what both parties agreed.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
