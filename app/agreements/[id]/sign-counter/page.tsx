import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import SignForm from "./SignForm";

function formatDate(date: Date | null) {
  if (!date) return "Not set";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default async function SignAgreementPage({
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
  const counterParty = agreement.parties.find((party) => party.role === "COUNTERPARTY");

  if (!counterParty) notFound();

  if (counterParty.email.toLowerCase() !== session.email.toLowerCase()) {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="Only the counterparty can sign here"
        message="This page is reserved for the counterparty named in the agreement. Use the agreement details page to see the next available action for your account."
      />
    );
  }

  if (agreement.status !== "DRAFT") {
    return (
      <NoticePage
        agreementId={agreement.id}
        title="This agreement is no longer open for counterparty signing"
        message="The counterparty signature step is already complete or the agreement status has changed. Review the agreement details for the latest status."
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
                <span style={pillStyle}>Counterparty review</span>
                <span style={{ ...pillStyle, background: "#FEF3C7", border: "none", color: "#92400e" }}>
                  Waiting for your signature
                </span>
              </div>
              <h1 style={titleStyle}>Review before signing</h1>
              <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "760px" }}>
                Confirm that the agreement matches what you and the creator discussed. Your typed signature, optional signature mark, consent, and timestamp will be attached to this record.
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
                <PartyBlock label="Creator" name={creator?.fullName ?? "Not provided"} email={creator?.email ?? "Not provided"} />
                <PartyBlock label="Counterparty" name={counterParty.fullName} email={counterParty.email} />
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
              <h2 style={sectionTitleStyle}>Your signature</h2>
              <SignForm agreementId={agreement.id} counterPartyName={counterParty.fullName} />
            </div>

            <div className="warning-surface" style={reviewNoteStyle}>
              <p style={{ margin: "0 0 8px", color: "#7c2d12", fontSize: "16px", fontWeight: 900 }}>
                Before you sign
              </p>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", lineHeight: 1.65 }}>
                Check the name, amount, payment schedule, delivery or service details, and what happens if either party cannot continue.
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

function PartyBlock({ label, name, email }: { label: string; name: string; email: string }) {
  return (
    <div style={{ border: "1px solid #eef2f7", borderRadius: "14px", padding: "14px", background: "#fbfdff" }}>
      <p style={{ margin: "0 0 5px", color: "#64748b", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "15px", fontWeight: 900 }}>
        {name}
      </p>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.45 }}>
        {email}
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
