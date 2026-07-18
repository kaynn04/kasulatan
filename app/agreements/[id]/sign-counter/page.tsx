import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import SignForm from "./SignForm";
import styles from "../../workflow.module.css";

function formatDate(date: Date | null) {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatAgreementType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function NoticePage({ agreementId, title, message }: { agreementId: string; title: string; message: string }) {
  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.noticeContainer}>
        <section className={styles.noticeCard}>
          <span className={styles.warningPill}>Signature unavailable</span>
          <h1 className={styles.noticeTitle}>{title}</h1>
          <p className={styles.noticeCopy}>{message}</p>
          <Link href={`/agreements/${agreementId}`} className={styles.primaryAction}>Back to agreement details</Link>
        </section>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={styles.summaryItemLabel}>{label}</span>
      <span className={styles.summaryItemValue}>{value}</span>
    </div>
  );
}

function PartyBlock({ label, name, email }: { label: string; name: string; email: string }) {
  return (
    <div className={styles.partyBlock}>
      <p className={styles.partyBlockLabel}>{label}</p>
      <p className={styles.partyBlockName}>{name}</p>
      <p className={styles.partyBlockMeta}>{email}</p>
    </div>
  );
}

export default async function SignAgreementPage({ params }: { params: Promise<{ id: string }> }) {
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
    include: { parties: true },
  });

  if (!agreement) notFound();

  const creator = agreement.parties.find((party) => party.role === "CREATOR");
  const counterparty = agreement.parties.find((party) => party.role === "COUNTERPARTY");
  if (!counterparty) notFound();

  if (counterparty.userId !== session.id) {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="Only the counterparty can sign here"
        message="This step is reserved for the counterparty named in the agreement. Return to the details page to see the action available to your account."
      />
    );
  }

  if (agreement.status !== "DRAFT") {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="Counterparty signing is already closed"
        message="The counterparty signature is complete or the agreement status has changed. Review the agreement details for its current state."
      />
    );
  }

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.container}>
        <Link href={`/agreements/${agreement.id}`} className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Back to agreement details
        </Link>

        <section className={styles.heroCard}>
          <div>
            <div className={styles.pillRow}>
              <span className={styles.pill}>Counterparty review</span>
              <span className={styles.warningPill}>Waiting for your signature</span>
            </div>
            <h1 className={styles.title}>Review before signing</h1>
            <p className={styles.lede}>
              Confirm that the record matches what you discussed. Your typed name, optional signature mark, consent, and timestamp become part of the agreement.
            </p>
            <h2 className={styles.recordTitle}>{agreement.title}</h2>
          </div>

          <aside className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Agreement summary</p>
            <div className={styles.summaryList}>
              <SummaryItem label="Type" value={formatAgreementType(agreement.agreementType)} />
              <SummaryItem label="Amount" value={`${agreement.currency} ${agreement.amount.toString()}`} />
              <SummaryItem label="Due date" value={formatDate(agreement.dueDate)} />
              <SummaryItem label="Reference" value={agreement.referenceNumber} />
            </div>
          </aside>
        </section>

        <section className={styles.signingLayout}>
          <div className={styles.stack}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Parties</h2>
              <div className={styles.partyGrid}>
                <PartyBlock label="Creator" name={creator?.fullName ?? "Not provided"} email={creator?.email ?? "Not provided"} />
                <PartyBlock label="Counterparty" name={counterparty.fullName} email={counterparty.email} />
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Subject of agreement</h2>
              <p className={styles.bodyText}>{agreement.subjectMatter}</p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Payment terms</h2>
              <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.paymentTerms}</p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Agreement terms</h2>
              <p className={`${styles.bodyText} ${styles.preWrap}`}>{agreement.termsText}</p>
            </section>
          </div>

          <aside className={`${styles.asideStack} ${styles.stickyAside}`}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Your signature</h2>
              <SignForm agreementId={agreement.id} counterPartyName={counterparty.fullName} />
            </section>

            <section className={styles.warningCard}>
              <h2>Before you sign</h2>
              <p>Check the names, value, payment schedule, delivery or service details, and what happens if either party cannot continue.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
