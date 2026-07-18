import Link from "next/link";
import { redirect } from "next/navigation";
import type { Agreement, AgreementParty } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type AgreementWithParties = Agreement & { parties: AgreementParty[] };

const closedStatuses = new Set(["FINALIZED", "CANCELLED", "EXPIRED"]);

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "22px",
      boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
    }}>
      <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: "13px", fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "34px", lineHeight: 1, fontWeight: 800 }}>
        {value}
      </p>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
        {helper}
      </p>
    </div>
  );
}

function AgreementRow({ agreement }: { agreement: AgreementWithParties }) {
  const counterparty = agreement.parties.find((party) => party.role === "COUNTERPARTY");

  return (
    <Link
      href={`/agreements/${agreement.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "16px",
        alignItems: "center",
        padding: "16px 18px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        textDecoration: "none",
        background: "#ffffff",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 6px", color: "#111827", fontSize: "15px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {agreement.title}
        </p>
        <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
          {agreement.agreementType} with {counterparty?.fullName ?? "counterparty"} - Updated {formatDate(agreement.updatedAt)}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          color: "#005461",
          background: "#E6FFFA",
          border: "1px solid #B7F7EC",
          borderRadius: "999px",
          padding: "5px 10px",
          fontSize: "12px",
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}>
          {formatStatus(agreement.status)}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "18px", lineHeight: 1 }}>&rarr;</span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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

  const createdByMe = agreements.filter((agreement) => agreement.createdById === session.id);
  const waitingForMe = agreements.filter((agreement) =>
    !closedStatuses.has(agreement.status) &&
    agreement.parties.some((party) => party.email.toLowerCase() === session.email.toLowerCase() && !party.signedAt)
  );
  const completed = agreements.filter((agreement) =>
    agreement.status === "FINALIZED" ||
    (agreement.parties.length > 0 && agreement.parties.every((party) => Boolean(party.signedAt)))
  );
  const active = agreements.filter((agreement) => !closedStatuses.has(agreement.status));
  const recentAgreements = agreements.slice(0, 5);

  return (
    <main style={{
      minHeight: "calc(100vh - 82px)",
      background: "#f8fafc",
      padding: "40px 32px 56px",
    }}>
      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
        <section className="dashboard-hero" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "24px",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#0C7779", fontSize: "13px", fontWeight: 800, textTransform: "uppercase" }}>
              Dashboard
            </p>
            <h1 style={{
              margin: "0 0 10px",
              color: "#0f172a",
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: "42px",
              lineHeight: 1.1,
            }}>
              Welcome back, {session.name.split(" ")[0]}.
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "640px" }}>
              Track agreements, signatures, and transaction records from one place. Start a new document before a deal
              moves forward, or review anything that still needs attention.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/agreements/new" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "#005461",
              color: "white",
              fontSize: "14px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 12px 24px rgba(0,84,97,0.18)",
            }}>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
              New agreement
            </Link>
            <Link href="/agreements" style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "white",
              color: "#334155",
              border: "1px solid #dbe3ea",
              fontSize: "14px",
              fontWeight: 800,
              textDecoration: "none",
            }}>
              View all
            </Link>
          </div>
        </section>

        <section className="dashboard-stats" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          <StatCard label="Total agreements" value={agreements.length} helper="All records connected to you." />
          <StatCard label="Created by you" value={createdByMe.length} helper="Transactions you started." />
          <StatCard label="Needs your signature" value={waitingForMe.length} helper="Review these first." />
          <StatCard label="Completed" value={completed.length} helper="Signed or finalized records." />
        </section>

        <section className="dashboard-main-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "24px",
          alignItems: "start",
        }}>
          <div style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", color: "#111827", fontSize: "18px", fontWeight: 800 }}>
                  Recent agreements
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Your latest transaction records and signature progress.
                </p>
              </div>
              <span style={{
                color: "#005461",
                background: "#E6FFFA",
                borderRadius: "999px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}>
                {active.length} active
              </span>
            </div>

            {recentAgreements.length > 0 ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {recentAgreements.map((agreement) => (
                  <AgreementRow key={agreement.id} agreement={agreement} />
                ))}
              </div>
            ) : (
              <div style={{
                border: "1px dashed #cbd5e1",
                borderRadius: "14px",
                padding: "36px 24px",
                textAlign: "center",
                background: "#f8fafc",
              }}>
                <p style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "17px", fontWeight: 800 }}>
                  No agreements yet
                </p>
                <p style={{ margin: "0 auto 18px", color: "#64748b", fontSize: "14px", lineHeight: 1.6, maxWidth: "420px" }}>
                  Create your first transaction record before payment, delivery, or lending starts.
                </p>
                <Link href="/agreements/new" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  background: "#005461",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 800,
                  textDecoration: "none",
                }}>
                  Create first agreement
                </Link>
              </div>
            )}
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{
              background: "#005461",
              color: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 14px 40px rgba(0,84,97,0.18)",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800 }}>
                Next best action
              </p>
              <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6 }}>
                {waitingForMe.length > 0
                  ? "You have agreements waiting for your review or signature."
                  : "Start by documenting the terms before both parties proceed."}
              </p>
              <Link href={waitingForMe.length > 0 ? "/agreements" : "/agreements/new"} style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                background: "#3BC1A8",
                color: "#005461",
                fontSize: "14px",
                fontWeight: 900,
                textDecoration: "none",
              }}>
                {waitingForMe.length > 0 ? "Review pending items" : "Create agreement"}
              </Link>
            </div>

            <div style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "24px",
            }}>
              <p style={{ margin: "0 0 14px", color: "#111827", fontSize: "16px", fontWeight: 800 }}>
                Better records include
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  "Clear names and contact details",
                  "Amount, deadline, and payment terms",
                  "What happens if the deal changes",
                  "Signatures or confirmation from both sides",
                ].map((item) => (
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
                      fontSize: "12px",
                      fontWeight: 900,
                      flexShrink: 0,
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
          </aside>
        </section>
      </div>
    </main>
  );
}
