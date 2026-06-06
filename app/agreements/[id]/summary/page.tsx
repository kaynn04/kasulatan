import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Agreement, AgreementParty, AuditLog } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import PrintButton from "./PrintButton";

type AgreementSummary = Agreement & {
  parties: AgreementParty[];
  auditLogs: AuditLog[];
};

function formatDate(date: Date | null) {
  if (!date) return "Not set";

  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
    <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
      <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: 0, color: "#111827", fontSize: "14px", fontWeight: 800, lineHeight: 1.45 }}>
        {value}
      </p>
    </div>
  );
}

function PartySection({ party, title }: { party: AgreementParty | undefined; title: string }) {
  if (!party) {
    return (
      <section style={printSectionStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <p style={bodyTextStyle}>No party information available.</p>
      </section>
    );
  }

  return (
    <section style={printSectionStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start", marginBottom: "16px" }}>
        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>{party.email}</p>
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

      <div className="summary-field-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
        <Field label="Full name" value={party.fullName} />
        <Field label="Mobile" value={party.mobileNumber ?? "Not provided"} />
        <Field label="Address" value={party.address ?? "Not provided"} />
        <Field label="Signed at" value={formatDateTime(party.signedAt)} />
        <Field label="Read agreement" value={party.confirmedReadAgreement ? "Confirmed" : "Not confirmed"} />
        <Field label="E-signature consent" value={party.consentedToElectronicSignature ? "Consented" : "Not confirmed"} />
      </div>

      {(party.typedSignature || party.signatureImage) && (
        <div style={{ marginTop: "18px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
          <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
            Signature
          </p>
          {party.typedSignature && (
            <p style={{ margin: "0 0 10px", color: "#0f172a", fontFamily: "'DM Serif Display', serif", fontSize: "25px" }}>
              {party.typedSignature}
            </p>
          )}
          {party.signatureImage && (
            <span className="signature-paper signature-paper-inline">
              <Image
                src={party.signatureImage}
                alt={`${party.fullName} signature mark`}
                width={420}
                height={120}
                unoptimized
                style={{ width: "100%", maxWidth: "360px", maxHeight: "90px", objectFit: "contain" }}
              />
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default async function AgreementSummaryPage({
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
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!agreement) notFound();

  const creator = getParty(agreement, "CREATOR");
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const isFinalized = agreement.status === "FINALIZED";

  return (
    <main className="summary-page" style={{
      minHeight: "calc(100vh - 72px)",
      background: "#f8fafc",
      padding: "40px 32px 56px",
    }}>
      <div style={{ width: "100%", maxWidth: "980px", margin: "0 auto" }}>
        <div className="summary-screen-actions" style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}>
          <Link href={`/agreements/${agreement.id}`} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#005461",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 900,
          }}>
            <span aria-hidden="true">&larr;</span>
            Back to agreement details
          </Link>
          <PrintButton pdfHref={`/agreements/${agreement.id}/summary.pdf`} />
        </div>

        {!isFinalized && (
          <div className="warning-surface" style={{
            marginBottom: "18px",
            border: "1px solid #fed7aa",
            background: "#fff7ed",
            color: "#9a3412",
            borderRadius: "14px",
            padding: "14px 16px",
            fontSize: "14px",
            fontWeight: 800,
            lineHeight: 1.55,
          }}>
            This summary is available for review, but the agreement is not finalized yet. It becomes strongest as proof after both parties sign.
          </div>
        )}

        <article className="summary-document" style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "18px",
          padding: "34px",
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
        }}>
          <header className="summary-document-header" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "18px",
            alignItems: "start",
            background: "#005461",
            borderBottom: "3px solid #005461",
            borderRadius: "14px 14px 0 0",
            padding: "28px 28px 24px",
            paddingBottom: "22px",
            margin: "-34px -34px 24px",
          }}>
            <div>
              <p style={{ margin: "0 0 8px", color: "#B7F7EC", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>
                Kasulatan transaction summary
              </p>
              <h1 style={{
                margin: "0 0 10px",
                color: "white",
                fontFamily: "'DM Serif Display', serif",
                fontSize: "40px",
                lineHeight: 1.08,
              }}>
                {agreement.title}
              </h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.6 }}>
                A printable summary of the agreement record, parties, signatures, and audit trail.
              </p>
            </div>
            <div className="brand-tint-surface" style={{
              border: "1px solid #B7F7EC",
              background: "#E6FFFA",
              borderRadius: "14px",
              padding: "14px",
              minWidth: "190px",
            }}>
              <p style={{ margin: "0 0 5px", color: "#005461", fontSize: "11px", fontWeight: 900, textTransform: "uppercase" }}>
                Status
              </p>
              <p style={{ margin: 0, color: "#005461", fontSize: "18px", fontWeight: 900 }}>
                {isFinalized ? "Finalized" : agreement.status.replaceAll("_", " ")}
              </p>
            </div>
          </header>

          <section style={printSectionStyle}>
            <h2 style={sectionTitleStyle}>Agreement details</h2>
            <div className="summary-field-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
              <Field label="Reference number" value={agreement.referenceNumber} />
              <Field label="Agreement type" value={agreement.agreementType} />
              <Field label="Amount" value={`${agreement.currency} ${agreement.amount.toString()}`} />
              <Field label="Due date" value={formatDate(agreement.dueDate)} />
              <Field label="Created" value={formatDate(agreement.createdAt)} />
              <Field label="Finalized" value={isFinalized ? formatDate(agreement.updatedAt) : "Not finalized"} />
            </div>
          </section>

          <section style={printSectionStyle}>
            <h2 style={sectionTitleStyle}>Subject matter</h2>
            <p style={bodyTextStyle}>{agreement.subjectMatter}</p>
          </section>

          <section style={printSectionStyle}>
            <h2 style={sectionTitleStyle}>Payment terms</h2>
            <p style={bodyTextStyle}>{agreement.paymentTerms}</p>
          </section>

          <section style={printSectionStyle}>
            <h2 style={sectionTitleStyle}>Agreement terms</h2>
            <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{agreement.termsText}</p>
          </section>

          <div className="summary-party-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
            <PartySection title="Creator" party={creator} />
            <PartySection title="Counterparty" party={counterparty} />
          </div>

          <section style={printSectionStyle}>
            <h2 style={sectionTitleStyle}>Audit trail</h2>
            {agreement.auditLogs.length > 0 ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {agreement.auditLogs.map((log) => (
                  <div key={log.id} style={{
                    display: "grid",
                    gridTemplateColumns: "170px minmax(0, 1fr)",
                    gap: "14px",
                    borderBottom: "1px solid #eef2f7",
                    paddingBottom: "10px",
                  }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: 800 }}>
                      {formatDateTime(log.createdAt)}
                    </p>
                    <div>
                      <p style={{ margin: "0 0 3px", color: "#0f172a", fontSize: "14px", fontWeight: 900 }}>
                        {actionLabel(log.action)}
                      </p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "12px", lineHeight: 1.45 }}>
                        {log.actorEmail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={bodyTextStyle}>No activity recorded.</p>
            )}
          </section>

          <footer style={{
            marginTop: "26px",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.6,
          }}>
            Generated from Kasulatan on {formatDateTime(new Date())}. This summary is a convenience copy of the agreement record and should be reviewed together with the full agreement details.
          </footer>
        </article>
      </div>
    </main>
  );
}

const printSectionStyle = {
  marginBottom: "22px",
};

const sectionTitleStyle = {
  margin: "0 0 14px",
  color: "#111827",
  fontSize: "17px",
  fontWeight: 900,
};

const bodyTextStyle = {
  margin: 0,
  color: "#334155",
  fontSize: "14px",
  lineHeight: 1.75,
};
