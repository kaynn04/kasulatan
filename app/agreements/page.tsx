import Link from "next/link";
import { redirect } from "next/navigation";
import type { Agreement, AgreementParty } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import styles from "../workspace.module.css";

type AgreementWithParties = Agreement & { parties: AgreementParty[] };
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const tabs = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs action" },
  { value: "created", label: "Created by me" },
  { value: "shared", label: "Shared with me" },
  { value: "completed", label: "Completed" },
];

const statuses = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT_TO_COUNTERPARTY", label: "Sent to counterparty" },
  { value: "VIEWED_BY_COUNTERPARTY", label: "Viewed by counterparty" },
  { value: "SIGNED_BY_COUNTERPARTY", label: "Waiting for creator" },
  { value: "SIGNED_BY_CREATOR", label: "Waiting for counterparty" },
  { value: "AWAITING_PAYMENT", label: "Payment pending" },
  { value: "FINALIZED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

const types = [
  { value: "all", label: "All types" },
  { value: "LOAN", label: "Loan" },
  { value: "SALE", label: "Sale" },
  { value: "SWAP", label: "Swap" },
  { value: "SERVICE", label: "Service" },
];

const roles = [
  { value: "all", label: "Any role" },
  { value: "creator", label: "Created by me" },
  { value: "counterparty", label: "I am counterparty" },
];

const scenarioGuidance: Record<string, string[]> = {
  LOAN: [
    "Exact amount borrowed and release date",
    "Repayment deadline and installment schedule",
    "Interest, late fees, or grace period if any",
    "What proof of payment both parties will keep",
  ],
  SALE: [
    "Item condition, included accessories, and defects",
    "Payment method, amount paid, and balance if any",
    "Delivery, pickup, or transfer date",
    "Return, refund, or no-return agreement",
  ],
  SWAP: [
    "Items or services exchanged by both parties",
    "Condition and estimated value of each side",
    "Handover date, place, and responsibility",
    "What happens if one side cannot deliver",
  ],
  SERVICE: [
    "Scope of work and expected deliverables",
    "Deadline, revisions, and acceptance terms",
    "Payment schedule and cancellation terms",
    "Materials, access, or information needed from each side",
  ],
};

function firstParam(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    SENT_TO_COUNTERPARTY: "Sent to counterparty",
    VIEWED_BY_COUNTERPARTY: "Viewed by counterparty",
    SIGNED_BY_CREATOR: "Waiting for counterparty",
    SIGNED_BY_COUNTERPARTY: "Waiting for creator",
    AWAITING_PAYMENT: "Payment pending",
    FINALIZED: "Completed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };

  return labels[status] ?? status;
}

function formatDate(date: Date | null) {
  if (!date) return "No due date";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(agreement: AgreementWithParties) {
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

function isCompleted(agreement: AgreementWithParties) {
  return (
    agreement.status === "FINALIZED" ||
    (agreement.parties.length > 0 && agreement.parties.every((party) => Boolean(party.signedAt)))
  );
}

function getCounterparty(agreement: AgreementWithParties) {
  return agreement.parties.find((party) => party.role === "COUNTERPARTY");
}

function getCurrentParty(agreement: AgreementWithParties, userId: string) {
  return agreement.parties.find((party) => party.userId === userId);
}

function needsAttention(agreement: AgreementWithParties, userId: string) {
  if (["FINALIZED", "CANCELLED", "EXPIRED"].includes(agreement.status)) return false;

  const currentParty = getCurrentParty(agreement, userId);
  const isCreator = agreement.createdById === userId;
  const isCounterparty = currentParty?.role === "COUNTERPARTY";
  const dueSoon =
    agreement.dueDate &&
    agreement.dueDate.getTime() >= Date.now() &&
    agreement.dueDate.getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000;

  return (
    agreement.status === "AWAITING_PAYMENT" ||
    Boolean(dueSoon) ||
    (isCounterparty && agreement.status === "DRAFT" && !currentParty?.signedAt) ||
    (isCreator && agreement.status === "SIGNED_BY_COUNTERPARTY" && !currentParty?.signedAt)
  );
}

function actionForAgreement(agreement: AgreementWithParties, userId: string) {
  const currentParty = getCurrentParty(agreement, userId);
  const isCreator = agreement.createdById === userId;
  const isCounterparty = currentParty?.role === "COUNTERPARTY";

  if (isCounterparty && agreement.status === "DRAFT" && !currentParty?.signedAt) {
    return { href: `/agreements/${agreement.id}/sign-counter`, label: "Review & sign", primary: true };
  }

  if (isCreator && agreement.status === "SIGNED_BY_COUNTERPARTY" && !currentParty?.signedAt) {
    return { href: `/agreements/${agreement.id}/sign-creator`, label: "Review & sign", primary: true };
  }

  if (agreement.status === "DRAFT" && isCreator) {
    return { href: `/agreements/${agreement.id}`, label: "Continue draft", primary: false };
  }

  return { href: `/agreements/${agreement.id}`, label: "View details", primary: false };
}

function statusClass(agreement: AgreementWithParties, actionNeeded: boolean) {
  if (actionNeeded) return styles.statusWarning;
  if (isCompleted(agreement)) return styles.statusComplete;
  return styles.statusNeutral;
}

function AgreementCard({ agreement, userId }: { agreement: AgreementWithParties; userId: string }) {
  const counterparty = getCounterparty(agreement);
  const currentParty = getCurrentParty(agreement, userId);
  const roleLabel = agreement.createdById === userId ? "You created this" : "Shared with you";
  const action = actionForAgreement(agreement, userId);
  const actionNeeded = needsAttention(agreement, userId);

  return (
    <article className={`${styles.agreementCard} ${actionNeeded ? styles.agreementCardNeedsAction : ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardMain}>
          <div className={styles.cardPills}>
            <span className={`${styles.typePill}`}>{agreement.agreementType}</span>
            <span className={`${styles.statusPill} ${statusClass(agreement, actionNeeded)}`}>
              {formatStatus(agreement.status)}
            </span>
            <span className={`${styles.rolePill} ${styles.statusNeutral}`}>{roleLabel}</span>
          </div>
          <h2>{agreement.title}</h2>
          <p className={styles.cardCounterparty}>
            {counterparty?.fullName ?? "Counterparty not specified"}
            {counterparty?.email ? ` · ${counterparty.email}` : ""}
          </p>
        </div>

        <Link href={action.href} className={`${styles.cardAction} ${action.primary ? styles.cardActionPrimary : ""}`}>
          {action.label}
        </Link>
      </div>

      <div className={styles.metaGrid}>
        <div>
          <span className={styles.metaLabel}>Amount</span>
          <span className={styles.metaValue}>{formatAmount(agreement)}</span>
        </div>
        <div>
          <span className={styles.metaLabel}>Due date</span>
          <span className={styles.metaValue}>{formatDate(agreement.dueDate)}</span>
        </div>
        <div>
          <span className={styles.metaLabel}>Reference</span>
          <span className={styles.metaValue}>{agreement.referenceNumber}</span>
        </div>
        <div>
          <span className={styles.metaLabel}>Your signature</span>
          <span className={styles.metaValue}>{currentParty?.signedAt ? "Signed" : "Not signed"}</span>
        </div>
      </div>
    </article>
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>
      <h2>{hasFilters ? "No agreements match your filters" : "No agreements yet"}</h2>
      <p>
        {hasFilters
          ? "Try clearing the filters or searching for a counterparty name, title, email, or reference number."
          : "Create a written record before payment, delivery, lending, or service work begins."}
      </p>
      <Link href={hasFilters ? "/agreements" : "/agreements/new"} className={styles.emptyAction}>
        {hasFilters ? "Clear filters" : "Create first agreement"}
      </Link>
    </div>
  );
}

export default async function AgreementsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const requestedTab = firstParam(params.tab, "all");
  const query = firstParam(params.q).trim();
  const requestedStatus = firstParam(params.status, "all");
  const requestedType = firstParam(params.type, "all");
  const requestedRole = firstParam(params.role, "all");
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab : "all";
  const status = statuses.some((option) => option.value === requestedStatus) ? requestedStatus : "all";
  const type = types.some((option) => option.value === requestedType) ? requestedType : "all";
  const role = roles.some((option) => option.value === requestedRole) ? requestedRole : "all";

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

  const withFlags = agreements.map((agreement) => ({
    agreement,
    isCreatedByMe: agreement.createdById === session.id,
    isSharedWithMe: agreement.parties.some(
      (party) => party.role === "COUNTERPARTY" && party.userId === session.id
    ),
    isCompleted: isCompleted(agreement),
    needsAttention: needsAttention(agreement, session.id),
  }));

  const attentionAgreements = withFlags
    .filter((item) => item.needsAttention)
    .map((item) => item.agreement);

  const tabCounts: Record<string, number> = {
    all: agreements.length,
    attention: withFlags.filter((item) => item.needsAttention).length,
    created: withFlags.filter((item) => item.isCreatedByMe).length,
    shared: withFlags.filter((item) => item.isSharedWithMe).length,
    completed: withFlags.filter((item) => item.isCompleted).length,
  };

  const filteredAgreements = withFlags
    .filter(({ agreement, isCreatedByMe, isSharedWithMe, isCompleted: itemIsCompleted, needsAttention: itemNeedsAttention }) => {
      const counterparty = getCounterparty(agreement);
      const haystack = [
        agreement.title,
        agreement.referenceNumber,
        agreement.subjectMatter,
        counterparty?.fullName,
        counterparty?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = status === "all" || agreement.status === status;
      const matchesType = type === "all" || agreement.agreementType === type;
      const matchesRole =
        role === "all" ||
        (role === "creator" && isCreatedByMe) ||
        (role === "counterparty" && isSharedWithMe);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "attention" && itemNeedsAttention) ||
        (activeTab === "created" && isCreatedByMe) ||
        (activeTab === "shared" && isSharedWithMe) ||
        (activeTab === "completed" && itemIsCompleted);

      return matchesQuery && matchesStatus && matchesType && matchesRole && matchesTab;
    })
    .map((item) => item.agreement);

  const selectedTypeGuidance = type !== "all" ? scenarioGuidance[type] : null;
  const hasFilters = Boolean(query) || status !== "all" || type !== "all" || role !== "all" || activeTab !== "all";

  function makeHref(overrides: Record<string, string>) {
    const next = new URLSearchParams();
    const values = { tab: activeTab, q: query, status, type, role, ...overrides };

    Object.entries(values).forEach(([key, value]) => {
      if (!value || value === "all") return;
      next.set(key, value);
    });

    const queryString = next.toString();
    return queryString ? `/agreements?${queryString}` : "/agreements";
  }

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.container}>
        <section className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>Agreement workspace</span>
            <h1>Your transaction records</h1>
            <p>Find, review, and track every agreement—from the first draft to both parties’ final confirmation.</p>
          </div>
          <div className={styles.pageActions}>
            <Link href="/agreements/new" className={styles.primaryAction}>
              <span aria-hidden="true">＋</span>
              New agreement
            </Link>
          </div>
        </section>

        <form action="/agreements" className={styles.filterCard}>
          <input type="hidden" name="tab" value={activeTab} />
          <label className={styles.searchControl}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <span className={styles.visuallyHidden}>Search agreements</span>
            <input
              className={styles.control}
              name="q"
              defaultValue={query}
              placeholder="Search title, party, email, or reference…"
            />
          </label>
          <select className={styles.control} name="status" defaultValue={status} aria-label="Filter by status">
            {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className={styles.control} name="type" defaultValue={type} aria-label="Filter by agreement type">
            {types.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className={styles.control} name="role" defaultValue={role} aria-label="Filter by your role">
            {roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="submit" className={styles.filterButton}>Apply filters</button>
        </form>

        <nav className={styles.tabs} aria-label="Agreement views">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={makeHref({ tab: tab.value })}
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ""}`}
              aria-current={activeTab === tab.value ? "page" : undefined}
            >
              {tab.label}
              <span className={styles.tabCount}>{tabCounts[tab.value]}</span>
            </Link>
          ))}
        </nav>

        {attentionAgreements.length > 0 && activeTab !== "attention" && (
          <section className={styles.attentionSection}>
            <div className={styles.attentionHeader}>
              <div>
                <h2>Needs your attention</h2>
                <p>Signing, payment, or due-date review may be required.</p>
              </div>
              <Link href={makeHref({ tab: "attention" })} className={styles.textLink}>View all <span aria-hidden="true">→</span></Link>
            </div>
            <div className={styles.attentionCards}>
              {attentionAgreements.slice(0, 2).map((agreement) => (
                <AgreementCard key={agreement.id} agreement={agreement} userId={session.id} />
              ))}
            </div>
          </section>
        )}

        <section className={styles.agreementsWorkspace}>
          <div>
            <div className={styles.resultsHeader}>
              <p>Showing {filteredAgreements.length} of {agreements.length} agreement{agreements.length === 1 ? "" : "s"}</p>
              {hasFilters && <Link href="/agreements" className={styles.textLink}>Clear filters</Link>}
            </div>
            <div className={styles.agreementCards}>
              {filteredAgreements.length > 0 ? (
                filteredAgreements.map((agreement) => (
                  <AgreementCard key={agreement.id} agreement={agreement} userId={session.id} />
                ))
              ) : (
                <EmptyState hasFilters={hasFilters} />
              )}
            </div>
          </div>

          <aside className={styles.agreementsAside}>
            <section className={styles.guideCard}>
              <h2>What should this include?</h2>
              <p>
                {type === "all"
                  ? "Choose a type filter to see guidance for that kind of agreement."
                  : `${types.find((item) => item.value === type)?.label ?? type} agreements should clearly cover:`}
              </p>
              <div className={styles.checklist}>
                {(selectedTypeGuidance ?? [
                  "Names and contact details of both parties",
                  "Amount, item, service, or exchange details",
                  "Deadline, delivery date, or repayment date",
                  "Payment terms and what happens if plans change",
                ]).map((item) => <CheckItem key={item}>{item}</CheckItem>)}
              </div>
            </section>

            <section className={styles.tipCard}>
              <div className={styles.actionEyebrow}>
                <span aria-hidden="true">✦</span>
                Before signing
              </div>
              <h2>Check the details together</h2>
              <p>Make sure the amount, due date, names, and payment terms match what both parties discussed.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
