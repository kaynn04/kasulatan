import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import SignCreatorForm from "./SignCreatorForm";
import styles from "../../workflow.module.css";

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

function PartyBlock({
  label,
  name,
  email,
  signedAt,
}: {
  label: string;
  name: string;
  email: string;
  signedAt: Date | null;
}) {
  return (
    <div className={styles.partyBlock}>
      <div className={styles.partyBlockTop}>
        <p className={styles.partyBlockLabel}>{label}</p>
        <span className={signedAt ? styles.completePill : styles.warningPill}>{signedAt ? "Signed" : "Pending"}</span>
      </div>
      <p className={styles.partyBlockName}>{name}</p>
      <p className={styles.partyBlockMeta}>{email}</p>
      <p className={styles.partyBlockDate}>{formatDateTime(signedAt)}</p>
    </div>
  );
}

export default async function SignCreatorAgreementPage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!creator) notFound();

  if (agreement.createdById !== session.id) {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="Only the creator can sign here"
        message="This final step belongs to the user who created the agreement. Return to the details page to see the action available to your account."
      />
    );
  }

  if (agreement.status === "FINALIZED") {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="This agreement is already finalized"
        message="Both required signatures are already recorded. Open the agreement details to review or print the completed record."
      />
    );
  }

  if (agreement.status !== "SIGNED_BY_COUNTERPARTY") {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="The counterparty has not signed yet"
        message="Creator signing becomes available after the counterparty reviews and signs the agreement."
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
              <span className={styles.pill}>Creator final review</span>
              <span className={styles.completePill}>Counterparty signed</span>
            </div>
            <h1 className={styles.title}>Finalize with your signature</h1>
            <p className={styles.lede}>The counterparty has signed. Review the full record one last time before adding your signature and finalizing it.</p>
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
                <PartyBlock label="Creator" name={creator.fullName} email={creator.email} signedAt={creator.signedAt} />
                <PartyBlock
                  label="Counterparty"
                  name={counterparty?.fullName ?? "Not provided"}
                  email={counterparty?.email ?? "Not provided"}
                  signedAt={counterparty?.signedAt ?? null}
                />
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
              <h2 className={styles.sectionTitle}>Your final signature</h2>
              <SignCreatorForm agreementId={agreement.id} creatorName={creator.fullName} />
            </section>

            <section className={styles.warningCard}>
              <h2>Final check</h2>
              <p>After you sign, this record becomes finalized. Confirm the counterparty signature, amounts, dates, terms, and responsibilities first.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
