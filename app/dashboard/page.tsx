import Link from "next/link";
import { redirect } from "next/navigation";
import type { Agreement, AgreementParty } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import styles from "../workspace.module.css";

type AgreementWithParties = Agreement & { parties: AgreementParty[] };
type StatTone = "blue" | "gold" | "clay";
type StatIcon = "documents" | "created" | "signature" | "completed";

const closedStatuses = new Set(["FINALIZED", "CANCELLED", "EXPIRED"]);

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    SENT_TO_COUNTERPARTY: "Sent",
    VIEWED_BY_COUNTERPARTY: "Viewed",
    SIGNED_BY_CREATOR: "Waiting for counterparty",
    SIGNED_BY_COUNTERPARTY: "Waiting for creator",
    AWAITING_PAYMENT: "Payment pending",
    FINALIZED: "Completed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };

  return labels[status] ?? status;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusClass(status: string) {
  if (status === "FINALIZED") return styles.statusComplete;
  if (["AWAITING_PAYMENT", "SIGNED_BY_CREATOR", "SIGNED_BY_COUNTERPARTY"].includes(status)) {
    return styles.statusWarning;
  }
  return styles.statusNeutral;
}

function isWaitingForUserSignature(agreement: AgreementWithParties, userId: string) {
  const currentParty = agreement.parties.find((party) => party.userId === userId);
  if (!currentParty || currentParty.signedAt || closedStatuses.has(agreement.status)) return false;

  return (
    (currentParty.role === "COUNTERPARTY" && agreement.status === "DRAFT") ||
    (agreement.createdById === userId && agreement.status === "SIGNED_BY_COUNTERPARTY")
  );
}

function StatGlyph({ icon }: { icon: StatIcon }) {
  if (icon === "created") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4z" />
      </svg>
    );
  }

  if (icon === "signature") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17c3-1 4-5 6-5 2.5 0 .5 5 3 5 2 0 2-3 4-3 1.5 0 1 3 5 3" />
        <path d="M3 21h18" />
      </svg>
    );
  }

  if (icon === "completed") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: number;
  helper: string;
  tone: StatTone;
  icon: StatIcon;
}) {
  return (
    <article className={styles.statCard} data-tone={tone}>
      <div className={styles.statTop}>
        <p className={styles.statLabel}>{label}</p>
        <span className={styles.statIcon}>
          <StatGlyph icon={icon} />
        </span>
      </div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statHelper}>{helper}</p>
    </article>
  );
}

function AgreementRow({ agreement }: { agreement: AgreementWithParties }) {
  const counterparty = agreement.parties.find((party) => party.role === "COUNTERPARTY");

  return (
    <Link href={`/agreements/${agreement.id}`} className={styles.agreementRow}>
      <div className={styles.rowMain}>
        <div className={styles.rowEyebrow}>
          <span>{agreement.agreementType}</span>
          <span>{agreement.referenceNumber}</span>
        </div>
        <h3 className={styles.rowTitle}>{agreement.title}</h3>
        <p className={styles.rowMeta}>
          With {counterparty?.fullName ?? "counterparty"} · Updated {formatDate(agreement.updatedAt)}
        </p>
      </div>
      <div className={styles.rowEnd}>
        <span className={`${styles.statusPill} ${statusClass(agreement.status)}`}>
          {formatStatus(agreement.status)}
        </span>
        <span className={styles.rowArrow} aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

function CheckItem({ children }: { children: string }) {
  return (
    <div className={styles.checkItem}>
      <span className={styles.checkMark} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4L6.5 11 3 7.5" />
        </svg>
      </span>
      <p>{children}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect("/login");

  const agreements = await prisma.agreement.findMany({
    where: {
      OR: [
        { createdById: session.id },
        { parties: { some: { userId: session.id } } },
      ],
    },
    include: { parties: true },
    orderBy: { updatedAt: "desc" },
  });

  const createdByMe = agreements.filter((agreement) => agreement.createdById === session.id);
  const waitingForMe = agreements.filter((agreement) => isWaitingForUserSignature(agreement, session.id));
  const completed = agreements.filter((agreement) =>
    agreement.status === "FINALIZED" ||
    (agreement.parties.length > 0 && agreement.parties.every((party) => Boolean(party.signedAt)))
  );
  const active = agreements.filter((agreement) => !closedStatuses.has(agreement.status));
  const recentAgreements = agreements.slice(0, 5);

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.container}>
        <section className={styles.dashboardHero}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Your workspace</span>
            <h1>Welcome back, {session.name.split(" ")[0]}.</h1>
            <p>
              Keep every agreement, signature, and transaction detail in one reliable record—ready whenever both sides need clarity.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/agreements/new" className={styles.goldAction}>
              <span aria-hidden="true">＋</span>
              New agreement
            </Link>
            <Link href="/agreements" className={styles.secondaryAction}>View all agreements</Link>
          </div>
        </section>

        <section className={styles.statsGrid} aria-label="Agreement summary">
          <StatCard label="Total agreements" value={agreements.length} helper="All records connected to you" tone="blue" icon="documents" />
          <StatCard label="Created by you" value={createdByMe.length} helper="Transactions you started" tone="clay" icon="created" />
          <StatCard label="Needs your signature" value={waitingForMe.length} helper="Your highest-priority reviews" tone="gold" icon="signature" />
          <StatCard label="Completed" value={completed.length} helper="Signed or finalized records" tone="blue" icon="completed" />
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Recent agreements</h2>
                <p>Your latest records and signature progress.</p>
              </div>
              <span className={styles.panelBadge}>{active.length} active</span>
            </div>

            {recentAgreements.length > 0 ? (
              <div className={styles.agreementRows}>
                {recentAgreements.map((agreement) => (
                  <AgreementRow key={agreement.id} agreement={agreement} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M12 13v6M9 16h6" />
                  </svg>
                </span>
                <h2>No agreements yet</h2>
                <p>Create a written record before payment, delivery, lending, or service work begins.</p>
                <Link href="/agreements/new" className={styles.emptyAction}>Create first agreement</Link>
              </div>
            )}
          </div>

          <aside className={styles.sideStack}>
            <section className={styles.actionCard}>
              <div className={styles.actionEyebrow}>
                <span aria-hidden="true">✦</span>
                Next best action
              </div>
              <h2>{waitingForMe.length > 0 ? `${waitingForMe.length} item${waitingForMe.length === 1 ? "" : "s"} need your review` : "Put the terms in writing"}</h2>
              <p>
                {waitingForMe.length > 0
                  ? "Review the agreement details before adding your signature or confirming payment."
                  : "Document the amount, deadline, and responsibilities before both parties proceed."}
              </p>
              <Link href={waitingForMe.length > 0 ? "/agreements?tab=attention" : "/agreements/new"} className={styles.goldAction}>
                {waitingForMe.length > 0 ? "Review pending items" : "Create an agreement"}
              </Link>
            </section>

            <section className={styles.guideCard}>
              <h2>Better records include</h2>
              <p>A quick quality check before you send an agreement.</p>
              <div className={styles.checklist}>
                <CheckItem>Clear names and contact details</CheckItem>
                <CheckItem>Amount, deadline, and payment terms</CheckItem>
                <CheckItem>What happens if the deal changes</CheckItem>
                <CheckItem>Confirmation from both parties</CheckItem>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
