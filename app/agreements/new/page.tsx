import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import CreateAgreementForm from "./CreateAgreementForm";

export default async function NewAgreementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main style={{
      minHeight: "calc(100vh - 82px)",
      background: "#f8fafc",
      padding: "40px 32px 56px",
    }}>
      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
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

          <section className="new-agreement-head" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: "24px",
            alignItems: "end",
          }}>
            <div>
              <p style={{ margin: "0 0 8px", color: "#0C7779", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>
                New Agreement
              </p>
              <h1 style={{
                margin: "0 0 10px",
                color: "#0f172a",
                fontFamily: "'DM Serif Display', serif",
                fontSize: "42px",
                lineHeight: 1.1,
              }}>
                Document the transaction before both parties proceed.
              </h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: "16px", lineHeight: 1.65, maxWidth: "720px" }}>
                Capture the amount, due date, payment terms, and the counterparty details in one formal record.
                The clearer the agreement is now, the easier it is to refer back to later.
              </p>
            </div>

            <div style={{
              background: "#005461",
              color: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 14px 40px rgba(0,84,97,0.18)",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 900 }}>
                Before you start
              </p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", fontSize: "14px", lineHeight: 1.6 }}>
                Make sure the other party already has a Kasulatan account. They will be matched using their email address.
              </p>
            </div>
          </section>
        </div>

        <section className="new-agreement-layout" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 330px",
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
            <CreateAgreementForm />
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
            }}>
              <p style={{ margin: "0 0 8px", color: "#111827", fontSize: "17px", fontWeight: 900 }}>
                Useful details to include
              </p>
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px", lineHeight: 1.6 }}>
                These details help support common scenarios like lending, marketplace sales, swaps, or service work.
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  "Names, emails, mobile numbers, and addresses",
                  "Amount, item, service, or exchange details",
                  "Deadline, repayment date, delivery date, or completion date",
                  "Payment method, installment schedule, and late terms",
                  "What happens if either side changes or cancels the deal",
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
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: "16px",
              padding: "22px",
            }}>
              <p style={{ margin: "0 0 8px", color: "#7c2d12", fontSize: "17px", fontWeight: 900 }}>
                Keep it specific
              </p>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", lineHeight: 1.65 }}>
                Avoid vague terms like pay soon or good condition. Use dates, amounts, item descriptions, and concrete responsibilities.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
