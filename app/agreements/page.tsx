import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import type { Agreement, AgreementParty } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type AgreementWithParties = Agreement & { parties: AgreementParty[] };
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const tabs = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs Action" },
  { value: "created", label: "Created by Me" },
  { value: "shared", label: "Shared With Me" },
  { value: "completed", label: "Completed" },
];

const statuses = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
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

function isCompleted(agreement: AgreementWithParties) {
  return (
    agreement.status === "FINALIZED" ||
    (agreement.parties.length > 0 && agreement.parties.every((party) => Boolean(party.signedAt)))
  );
}

function getCounterparty(agreement: AgreementWithParties) {
  return agreement.parties.find((party) => party.role === "COUNTERPARTY");
}

function getCurrentParty(agreement: AgreementWithParties, email: string) {
  return agreement.parties.find((party) => party.email.toLowerCase() === email.toLowerCase());
}

function needsAttention(agreement: AgreementWithParties, userId: string, email: string) {
  if (["FINALIZED", "CANCELLED", "EXPIRED"].includes(agreement.status)) {
    return false;
  }

  const currentParty = getCurrentParty(agreement, email);
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

function actionForAgreement(agreement: AgreementWithParties, userId: string, email: string) {
  const currentParty = getCurrentParty(agreement, email);
  const isCreator = agreement.createdById === userId;
  const isCounterparty = currentParty?.role === "COUNTERPARTY";

  if (isCounterparty && agreement.status === "DRAFT" && !currentParty?.signedAt) {
    return { href: `/agreements/${agreement.id}/sign-counter`, label: "Sign" };
  }

  if (isCreator && agreement.status === "SIGNED_BY_COUNTERPARTY" && !currentParty?.signedAt) {
    return { href: `/agreements/${agreement.id}/sign-creator`, label: "Sign" };
  }

  if (agreement.status === "DRAFT" && isCreator) {
    return { href: `/agreements/${agreement.id}`, label: "Continue draft" };
  }

  return { href: `/agreements/${agreement.id}`, label: "View" };
}

function AgreementCard({
  agreement,
  userId,
  email,
}: {
  agreement: AgreementWithParties;
  userId: string;
  email: string;
}) {
  const counterparty = getCounterparty(agreement);
  const currentParty = getCurrentParty(agreement, email);
  const roleLabel = agreement.createdById === userId ? "You created this" : "Shared with you";
  const action = actionForAgreement(agreement, userId, email);
  const isActionNeeded = needsAttention(agreement, userId, email);

  return (
    <article style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "18px",
      boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "16px", alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
            <span style={{
              color: "#005461",
              background: "#E6FFFA",
              border: "1px solid #B7F7EC",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 800,
            }}>
              {agreement.agreementType}
            </span>
            <span style={{
              color: isActionNeeded ? "#92400e" : "#475569",
              background: isActionNeeded ? "#FEF3C7" : "#f1f5f9",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 800,
            }}>
              {formatStatus(agreement.status)}
            </span>
          </div>
          <h2 style={{
            margin: "0 0 8px",
            color: "#0f172a",
            fontSize: "18px",
            fontWeight: 900,
            lineHeight: 1.25,
          }}>
            {agreement.title}
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.55 }}>
            Counterparty: {counterparty?.fullName ?? "Not specified"} - {counterparty?.email ?? "No email"}
          </p>
        </div>

        <Link href={action.href} style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "112px",
          padding: "10px 14px",
          borderRadius: "10px",
          background: action.label === "Sign" ? "#005461" : "#ffffff",
          color: action.label === "Sign" ? "white" : "#005461",
          border: action.label === "Sign" ? "1px solid #005461" : "1px solid #B7F7EC",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}>
          {action.label}
        </Link>
      </div>

      <div className="agreement-card-meta" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "12px",
        marginTop: "18px",
        paddingTop: "16px",
        borderTop: "1px solid #eef2f7",
      }}>
        {[
          ["Amount", `PHP ${agreement.amount.toString()}`],
          ["Due date", formatDate(agreement.dueDate)],
          ["Role", roleLabel],
          ["Your signature", currentParty?.signedAt ? "Signed" : "Not signed"],
        ].map(([label, value]) => (
          <div key={label}>
            <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
              {label}
            </p>
            <p style={{ margin: 0, color: "#334155", fontSize: "13px", fontWeight: 700, lineHeight: 1.35 }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div style={{
      background: "white",
      border: "1px dashed #cbd5e1",
      borderRadius: "16px",
      padding: "42px 24px",
      textAlign: "center",
    }}>
      <p style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "18px", fontWeight: 900 }}>
        {hasFilters ? "No agreements match your filters" : "No agreements yet"}
      </p>
      <p style={{ margin: "0 auto 20px", color: "#64748b", fontSize: "14px", lineHeight: 1.6, maxWidth: "440px" }}>
        {hasFilters
          ? "Try clearing the filters or searching for a counterparty name, title, email, or reference number."
          : "Create a written record before payment, delivery, lending, or service work starts."}
      </p>
      <Link href={hasFilters ? "/agreements" : "/agreements/new"} style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "11px 16px",
        borderRadius: "10px",
        background: "#005461",
        color: "white",
        fontSize: "14px",
        fontWeight: 900,
        textDecoration: "none",
      }}>
        {hasFilters ? "Clear filters" : "Create first agreement"}
      </Link>
    </div>
  );
}

export default async function AgreementsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const activeTab = firstParam(params.tab, "all");
  const query = firstParam(params.q).trim();
  const status = firstParam(params.status, "all");
  const type = firstParam(params.type, "all");
  const role = firstParam(params.role, "all");

  const agreements = await prisma.agreement.findMany({
    where: {
      OR: [
        { createdById: session.id },
        { parties: { some: { email: session.email } } },
      ],
    },
    include: { parties: true },
    orderBy: { updatedAt: "desc" },
  });

  const withFlags = agreements.map((agreement) => ({
    agreement,
    isCreatedByMe: agreement.createdById === session.id,
    isSharedWithMe: agreement.parties.some(
      (party) => party.role === "COUNTERPARTY" && party.email.toLowerCase() === session.email.toLowerCase()
    ),
    isCompleted: isCompleted(agreement),
    needsAttention: needsAttention(agreement, session.id, session.email),
  }));

  const attentionAgreements = withFlags
    .filter((item) => item.needsAttention)
    .map((item) => item.agreement);

  const filteredAgreements = withFlags
    .filter(({ agreement, isCreatedByMe, isSharedWithMe, isCompleted, needsAttention: itemNeedsAttention }) => {
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
        (activeTab === "completed" && isCompleted);

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

    const qs = next.toString();
    return qs ? `/agreements?${qs}` : "/agreements";
  }

  return (
    <main style={{
      minHeight: "calc(100vh - 82px)",
      background: "#f8fafc",
      padding: "40px 32px 56px",
    }}>
      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
        <section className="agreements-page-head" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "24px",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#0C7779", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>
              Agreements
            </p>
            <h1 style={{ margin: "0 0 10px", color: "#0f172a", fontFamily: "'DM Serif Display', serif", fontSize: "42px", lineHeight: 1.1 }}>
              Your transaction records
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "680px" }}>
              Review, create, and track agreements for marketplace deals, loans, services, swaps, and family arrangements.
            </p>
          </div>
          <Link href="/agreements/new" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 18px",
            borderRadius: "10px",
            background: "#005461",
            color: "white",
            fontSize: "14px",
            fontWeight: 900,
            textDecoration: "none",
            boxShadow: "0 12px 24px rgba(0,84,97,0.18)",
          }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
            New agreement
          </Link>
        </section>

        <form action="/agreements" style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) repeat(3, minmax(150px, 180px)) auto",
          gap: "12px",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "18px",
          boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
        }} className="agreements-filter-bar">
          <input type="hidden" name="tab" value={activeTab} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search title, counterparty, email, reference..."
            style={{
              width: "100%",
              border: "1px solid #dbe3ea",
              borderRadius: "10px",
              padding: "11px 12px",
              color: "#0f172a",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          />
          <select name="status" defaultValue={status} style={selectStyle}>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select name="type" defaultValue={type} style={selectStyle}>
            {types.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select name="role" defaultValue={role} style={selectStyle}>
            {roles.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="submit" style={{
            border: "none",
            borderRadius: "10px",
            background: "#005461",
            color: "white",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: 900,
            padding: "11px 16px",
            cursor: "pointer",
          }}>
            Filter
          </button>
        </form>

        <nav className="agreements-tabs" style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px" }}>
          {tabs.map((tab) => (
            <Link key={tab.value} href={makeHref({ tab: tab.value })} style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 13px",
              borderRadius: "999px",
              background: activeTab === tab.value ? "#005461" : "white",
              color: activeTab === tab.value ? "white" : "#475569",
              border: activeTab === tab.value ? "1px solid #005461" : "1px solid #e5e7eb",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}>
              {tab.label}
            </Link>
          ))}
        </nav>

        {attentionAgreements.length > 0 && activeTab !== "attention" && (
          <section style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", color: "#7c2d12", fontSize: "17px", fontWeight: 900 }}>
                  Needs attention
                </h2>
                <p style={{ margin: 0, color: "#9a3412", fontSize: "13px" }}>
                  Agreements that may need signing, payment, or due-date review.
                </p>
              </div>
              <Link href={makeHref({ tab: "attention" })} style={{ color: "#9a3412", fontSize: "13px", fontWeight: 900, textDecoration: "none" }}>
                View all
              </Link>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {attentionAgreements.slice(0, 2).map((agreement) => (
                <AgreementCard key={agreement.id} agreement={agreement} userId={session.id} email={session.email} />
              ))}
            </div>
          </section>
        )}

        <section className="agreements-workspace" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 330px",
          gap: "24px",
          alignItems: "start",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
              <p style={{ margin: 0, color: "#334155", fontSize: "14px", fontWeight: 900 }}>
                Showing {filteredAgreements.length} of {agreements.length} agreement{agreements.length === 1 ? "" : "s"}
              </p>
              {hasFilters && (
                <Link href="/agreements" style={{ color: "#005461", fontSize: "13px", fontWeight: 900, textDecoration: "none" }}>
                  Clear filters
                </Link>
              )}
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredAgreements.length > 0 ? (
                filteredAgreements.map((agreement) => (
                  <AgreementCard key={agreement.id} agreement={agreement} userId={session.id} email={session.email} />
                ))
              ) : (
                <EmptyState hasFilters={hasFilters} />
              )}
            </div>
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
            }}>
              <p style={{ margin: "0 0 8px", color: "#111827", fontSize: "17px", fontWeight: 900 }}>
                What should this include?
              </p>
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px", lineHeight: 1.6 }}>
                {type === "all"
                  ? "Choose a type filter to see scenario-specific guidance."
                  : `${types.find((item) => item.value === type)?.label ?? type} agreements should clearly cover:`}
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {(selectedTypeGuidance ?? [
                  "Names and contact details of both parties",
                  "Amount, item, service, or exchange details",
                  "Deadline, delivery date, or repayment date",
                  "Payment terms and what happens if plans change",
                ]).map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "7px",
                      background: "#E6FFFA",
                      color: "#005461",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 4L6.5 11 3 7.5" />
                      </svg>
                    </span>
                    <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "#005461",
              borderRadius: "16px",
              padding: "22px",
              color: "white",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 900 }}>
                Tip before signing
              </p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", fontSize: "14px", lineHeight: 1.65 }}>
                Make sure the amount, due date, names, and payment terms match what both parties discussed in chat or in person.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

const selectStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #dbe3ea",
  borderRadius: "10px",
  padding: "11px 12px",
  color: "#0f172a",
  fontSize: "14px",
  fontFamily: "inherit",
  background: "white",
};
