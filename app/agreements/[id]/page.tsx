import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Agreement, AgreementParty, AuditLog } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function getNextAction(agreement: AgreementWithDetails, sessionId: string, sessionEmail: string) {
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const creator = getParty(agreement, "CREATOR");
  const isCreator = agreement.createdById === sessionId;
  const isCounterparty = counterparty?.email.toLowerCase() === sessionEmail.toLowerCase();

  if (isCounterparty && agreement.status === "DRAFT" && !counterparty?.signedAt) {
    return {
      href: `/agreements/${agreement.id}/sign-counter`,
      label: "Review and sign",
      helper: "You are the counterparty. Review the full record before signing.",
    };
  }

  if (isCreator && agreement.status === "SIGNED_BY_COUNTERPARTY" && !creator?.signedAt) {
    return {
      href: `/agreements/${agreement.id}/sign-creator`,
      label: "Finalize with signature",
      helper: "The counterparty has signed. Your signature will finalize the record.",
    };
  }

  if (agreement.status === "FINALIZED") {
    return {
      href: `/agreements/${agreement.id}/summary`,
      label: "Print summary",
      helper: "This agreement is completed. Save or print a summary for your records.",
    };
  }

  return {
    href: "/agreements",
    label: "Back to agreements",
    helper: "No signature action is available for your account right now.",
  };
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: "0 0 5px", color: "#94a3b8", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: 0, color: "#0f172a", fontSize: "14px", fontWeight: 800, lineHeight: 1.45 }}>
        {value}
      </p>
    </div>
  );
}

function PartyCard({ party, title }: { party: AgreementParty | undefined; title: string }) {
  if (!party) {
    return (
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>No party information available.</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
            {party.email}
          </p>
        </div>
        <span style={{
          color: party.signedAt ? "#005461" : "#92400e",
          background: party.signedAt ? "#E6FFFA" : "#FEF3C7",
          borderRadius: "999px",
          padding: "5px 10px",
          fontSize: "12px",
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}>
          {party.signedAt ? "Signed" : "Not signed"}
        </span>
      </div>

      <div className="agreement-detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
        <DetailItem label="Name" value={party.fullName} />
        <DetailItem label="Mobile" value={party.mobileNumber ?? "Not provided"} />
        <DetailItem label="Address" value={party.address ?? "Not provided"} />
        <DetailItem label="Signed at" value={formatDateTime(party.signedAt)} />
        <DetailItem label="Read agreement" value={party.confirmedReadAgreement ? "Confirmed" : "Not confirmed"} />
        <DetailItem label="E-signature consent" value={party.consentedToElectronicSignature ? "Consented" : "Not yet"} />
      </div>

      {party.typedSignature && (
        <div style={{
          marginTop: "18px",
          borderTop: "1px solid #eef2f7",
          paddingTop: "16px",
        }}>
          <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: "12px", fontWeight: 900 }}>
            Typed signature
          </p>
          <p style={{ margin: 0, color: "#0f172a", fontFamily: "'DM Serif Display', serif", fontSize: "24px" }}>
            {party.typedSignature}
          </p>
        </div>
      )}

      {party.signatureImage && (
        <div style={{
          marginTop: "14px",
          border: "1px dashed #cbd5e1",
          borderRadius: "14px",
          padding: "12px",
          background: "#fbfdff",
        }}>
          <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "12px", fontWeight: 900 }}>
            Signature mark
          </p>
          <Image
            src={party.signatureImage}
            alt={`${party.fullName} signature`}
            width={420}
            height={120}
            unoptimized
            style={{
            width: "100%",
            maxHeight: "90px",
            objectFit: "contain",
          }} />
        </div>
      )}
    </div>
  );
}

export default async function AgreementDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const agreement = await prisma.agreement.findFirst({
    where: {
      id,
      OR: [
        { createdById: session.id },
        { parties: { some: { email: session.email } } },
      ],
    },
    include: {
      parties: true,
      auditLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agreement) notFound();

  const creator = getParty(agreement, "CREATOR");
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const nextAction = getNextAction(agreement, session.id, session.email);
  const isFinalized = agreement.status === "FINALIZED";

  return (
    <main style={{
      minHeight: "calc(100vh - 82px)",
      background: "#f8fafc",
      padding: "40px 32px 56px",
    }}>
      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
        <Link href="/agreements" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#005461",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 900,
          marginBottom: "18px",
        }}>
          <span aria-hidden="true">&larr;</span>
          Back to agreements
        </Link>

        <section style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
          marginBottom: "24px",
        }}>
          <div className="agreement-detail-hero" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            gap: "24px",
            alignItems: "start",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={pillStyle}>{agreement.agreementType}</span>
                <span style={{
                  ...pillStyle,
                  color: isFinalized ? "#005461" : "#92400e",
                  background: isFinalized ? "#E6FFFA" : "#FEF3C7",
                  border: "none",
                }}>
                  {formatStatus(agreement.status)}
                </span>
              </div>
              <h1 style={{
                margin: "0 0 12px",
                color: "#0f172a",
                fontFamily: "'DM Serif Display', serif",
                fontSize: "42px",
                lineHeight: 1.08,
              }}>
                {agreement.title}
              </h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "760px" }}>
                {agreement.subjectMatter}
              </p>
            </div>

            <aside style={{
              background: "#005461",
              color: "white",
              borderRadius: "16px",
              padding: "20px",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 900 }}>
                Next action
              </p>
              <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.76)", fontSize: "13px", lineHeight: 1.55 }}>
                {nextAction.helper}
              </p>
              <Link href={nextAction.href} style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                background: "#3BC1A8",
                color: "#005461",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 900,
              }}>
                {nextAction.label}
              </Link>
            </aside>
          </div>

          <div className="agreement-detail-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "26px",
            paddingTop: "22px",
            borderTop: "1px solid #eef2f7",
          }}>
            <DetailItem label="Reference" value={agreement.referenceNumber} />
            <DetailItem label="Amount" value={`${agreement.currency} ${agreement.amount.toString()}`} />
            <DetailItem label="Due date" value={formatDate(agreement.dueDate)} />
            <DetailItem label="Created" value={formatDate(agreement.createdAt)} />
            <DetailItem label="Updated" value={formatDate(agreement.updatedAt)} />
          </div>
        </section>

        <section className="agreement-detail-layout" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "24px",
          alignItems: "start",
        }}>
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Payment terms</h2>
              <p style={{ margin: 0, color: "#334155", fontSize: "15px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {agreement.paymentTerms}
              </p>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Agreement terms</h2>
              <p style={{ margin: 0, color: "#334155", fontSize: "15px", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {agreement.termsText}
              </p>
            </div>

            <div className="agreement-parties-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <PartyCard title="Creator" party={creator} />
              <PartyCard title="Counterparty" party={counterparty} />
            </div>
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Signing progress</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  { label: "Counterparty reviews and signs", done: Boolean(counterparty?.signedAt) },
                  { label: "Creator reviews and signs", done: Boolean(creator?.signedAt) },
                  { label: "Agreement finalized", done: agreement.status === "FINALIZED" },
                ].map((step, index) => (
                  <div key={step.label} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "10px", alignItems: "start" }}>
                    <span style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "9px",
                      background: step.done ? "#E6FFFA" : "#f1f5f9",
                      color: step.done ? "#005461" : "#64748b",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}>
                      {step.done ? (
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 4L6.5 11 3 7.5" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.5, fontWeight: 700 }}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Activity log</h2>
              {agreement.auditLogs.length > 0 ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {agreement.auditLogs.map((log) => (
                    <div key={log.id} style={{ borderLeft: "3px solid #B7F7EC", paddingLeft: "12px" }}>
                      <p style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "14px", fontWeight: 900 }}>
                        {actionLabel(log.action)}
                      </p>
                      <p style={{ margin: "0 0 3px", color: "#64748b", fontSize: "12px", lineHeight: 1.45 }}>
                        {log.actorEmail}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                  No activity recorded yet.
                </p>
              )}
            </div>

            <div style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: "16px",
              padding: "20px",
            }}>
              <p style={{ margin: "0 0 8px", color: "#7c2d12", fontSize: "16px", fontWeight: 900 }}>
                Review carefully
              </p>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", lineHeight: 1.65 }}>
                Before signing, make sure the names, amount, due date, payment terms, and responsibilities match what both parties agreed to.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
};

const sectionTitleStyle = {
  margin: "0 0 14px",
  color: "#111827",
  fontSize: "17px",
  fontWeight: 900,
};

const pillStyle = {
  color: "#005461",
  background: "#E6FFFA",
  border: "1px solid #B7F7EC",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 900,
};
