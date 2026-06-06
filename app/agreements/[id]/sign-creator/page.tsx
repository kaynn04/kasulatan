import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import SignCreatorForm from "./SignCreatorForm";

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

function formatAgreementType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function NoticePage({
  agreementId,
  title,
  message,
}: {
  agreementId: string;
  title: string;
  message: string;
}) {
  return (
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: "760px", margin: "0 auto" }}>
        <section style={cardStyle}>
          <span style={pillStyle}>Signature unavailable</span>
          <h1 style={titleStyle}>{title}</h1>
          <p style={{ margin: "0 0 22px", color: "#64748b", fontSize: "15px", lineHeight: 1.65 }}>
            {message}
          </p>
          <Link href={`/agreements/${agreementId}`} style={primaryLinkStyle}>
            Back to agreement details
          </Link>
        </section>
      </div>
    </main>
  );
}

export default async function SignCreatorAgreementPage({
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
    },
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
        message="This page is reserved for the user who created the agreement. Use the agreement details page to see the next available action for your account."
      />
    );
  }

  if (agreement.status === "FINALIZED") {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="This agreement is already finalized"
        message="Both required signatures have already been recorded. You can review the completed agreement details instead."
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
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
        <Link href={`/agreements/${agreement.id}`} style={backLinkStyle}>
          <span aria-hidden="true">&larr;</span>
          Back to agreement details
        </Link>

        <section style={heroStyle}>
          <div className="signing-hero" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: "24px",
            alignItems: "stretch",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={pillStyle}>Creator final review</span>
                <span style={{ ...pillStyle, background: "#E6FFFA", border: "none", color: "#005461" }}>
                  Counterparty signed
                </span>
              </div>
              <h1 style={titleStyle}>Finalize with your signature</h1>
              <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "760px" }}>
                The counterparty has signed. Review the agreement one last time before adding your signature and finalizing the record.
              </p>
              <h2 style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "22px",
                lineHeight: 1.25,
                fontWeight: 900,
              }}>
                {agreement.title}
              </h2>
            </div>

            <aside style={summaryPanelStyle}>
              <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.72)", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>
                Agreement summary
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                <SummaryItem label="Type" value={formatAgreementType(agreement.agreementType)} />
                <SummaryItem label="Amount" value={`${agreement.currency} ${agreement.amount.toString()}`} />
                <SummaryItem label="Due date" value={formatDate(agreement.dueDate)} />
                <SummaryItem label="Reference" value={agreement.referenceNumber} />
              </div>
            </aside>
          </div>
        </section>

        <section className="signing-layout" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 380px",
          gap: "24px",
          alignItems: "start",
        }}>
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Parties</h2>
              <div className="signing-party-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                <PartyBlock
                  label="Creator"
                  name={creator.fullName}
                  email={creator.email}
                  signedAt={creator.signedAt}
                />
                <PartyBlock
                  label="Counterparty"
                  name={counterparty?.fullName ?? "Not provided"}
                  email={counterparty?.email ?? "Not provided"}
                  signedAt={counterparty?.signedAt ?? null}
                />
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Subject of agreement</h2>
              <p style={bodyTextStyle}>{agreement.subjectMatter}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Payment terms</h2>
              <p style={bodyTextStyle}>{agreement.paymentTerms}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Agreement terms</h2>
              <p style={{ ...bodyTextStyle, whiteSpace: "pre-wrap" }}>{agreement.termsText}</p>
            </div>
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={cardStyle}>
              <h2 style={sectionTitleStyle}>Your final signature</h2>
              <SignCreatorForm agreementId={agreement.id} creatorName={creator.fullName} />
            </div>

            <div className="warning-surface" style={reviewNoteStyle}>
              <p style={{ margin: "0 0 8px", color: "#7c2d12", fontSize: "16px", fontWeight: 900 }}>
                Final check
              </p>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", lineHeight: 1.65 }}>
                Once you sign, this agreement becomes finalized. Confirm the counterparty signature, payment terms, dates, and responsibilities before submitting.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: "0 0 3px", color: "rgba(255,255,255,0.62)", fontSize: "12px", fontWeight: 900 }}>
        {label}
      </p>
      <p style={{ margin: 0, color: "white", fontSize: "15px", fontWeight: 900, lineHeight: 1.35 }}>
        {value}
      </p>
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
    <div style={{ border: "1px solid #eef2f7", borderRadius: "14px", padding: "14px", background: "#fbfdff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>
          {label}
        </p>
        <span style={{
          color: signedAt ? "#005461" : "#92400e",
          background: signedAt ? "#E6FFFA" : "#FEF3C7",
          borderRadius: "999px",
          padding: "4px 8px",
          fontSize: "11px",
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}>
          {signedAt ? "Signed" : "Pending"}
        </span>
      </div>
      <p style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "15px", fontWeight: 900 }}>
        {name}
      </p>
      <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "13px", lineHeight: 1.45 }}>
        {email}
      </p>
      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: 1.45 }}>
        {formatDateTime(signedAt)}
      </p>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 72px)",
  background: "#f8fafc",
  padding: "40px 32px 56px",
};

const backLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#005461",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 900,
  marginBottom: "18px",
};

const heroStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
  marginBottom: "24px",
};

const cardStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
};

const titleStyle = {
  margin: "0 0 12px",
  color: "#0f172a",
  fontFamily: "'DM Serif Display', serif",
  fontSize: "42px",
  lineHeight: 1.08,
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

const summaryPanelStyle = {
  background: "#005461",
  color: "white",
  borderRadius: "16px",
  padding: "20px",
};

const bodyTextStyle = {
  margin: 0,
  color: "#334155",
  fontSize: "15px",
  lineHeight: 1.75,
};

const reviewNoteStyle = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: "16px",
  padding: "20px",
};

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  padding: "0 16px",
  borderRadius: "12px",
  background: "#3BC1A8",
  color: "#005461",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 900,
};
