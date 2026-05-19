import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const userCount = await prisma.user.count();

  const examples = [
    "Marketplace item sales",
    "Borrowing or lending money",
    "Family payment arrangements",
    "Service or project agreements",
  ];

  const steps = [
    "Write the transaction details",
    "Let both parties review the terms",
    "Keep a signed record for reference",
  ];

  return (
    <main style={{
      minHeight: "calc(100vh - 100px)",
      padding: 0,
      margin: 0,
      background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Decorative circles */}
      <span style={{
        position: "absolute", top: "-100px", left: "-100px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "rgba(59,193,168,0.12)", pointerEvents: "none",
      }} />
      <span style={{
        position: "absolute", bottom: "-60px", right: "-60px",
        width: "350px", height: "350px", borderRadius: "50%",
        background: "rgba(0,84,97,0.3)", pointerEvents: "none",
      }} />
      <span style={{
        position: "absolute", top: "30%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(36,158,148,0.15)", pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "72px 40px 56px",
      }}>
        <section className="home-hero-grid" style={{
          display: "grid",
          gap: "48px",
          alignItems: "center",
        }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59,193,168,0.15)",
              border: "1px solid rgba(59,193,168,0.3)",
              borderRadius: "9999px",
              padding: "6px 16px",
              marginBottom: "28px",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#3BC1A8", flexShrink: 0,
              }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                {userCount.toLocaleString()} users trust Kasulatan
              </span>
            </div>

            <h1 className="home-hero-title" style={{
              fontFamily: "'DM Serif Display', serif",
              lineHeight: 1.05,
              color: "white",
              margin: "0 0 22px",
              maxWidth: "720px",
            }}>
              Make everyday agreements clearer before money or items change hands.
            </h1>

            <p style={{
              fontSize: "19px",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.78)",
              margin: "0 0 18px",
              maxWidth: "650px",
            }}>
              Kasulatan helps two parties turn a chat-based or verbal transaction into a more formal written record.
              It is made for practical deals like marketplace sales, lending between relatives, payment promises, and
              small service arrangements.
            </p>

            <p style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.62)",
              margin: "0 0 34px",
              maxWidth: "620px",
            }}>
              The goal is simple: both sides can see what was agreed, confirm the important details, and keep a document
              they can refer back to if the transaction is questioned later.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href={session ? "/dashboard" : "/register"} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#3BC1A8",
                color: "#005461",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 700,
                padding: "13px 28px",
                borderRadius: "10px",
              }}>
                {session ? "Go to dashboard" : "Create an agreement"}
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>

              <Link href={session ? "/agreements" : "/login"} style={{
                display: "inline-flex",
                alignItems: "center",
                background: "transparent",
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 500,
                padding: "13px 28px",
                borderRadius: "10px",
                border: "1.5px solid rgba(255,255,255,0.3)",
              }}>
                {session ? "View agreements" : "Sign in"}
              </Link>
            </div>
          </div>

          <aside style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "16px",
            padding: "28px",
            backdropFilter: "blur(10px)",
          }}>
            <p style={{ margin: "0 0 18px", color: "white", fontSize: "17px", fontWeight: 700 }}>
              Good for agreements about:
            </p>
            <div style={{ display: "grid", gap: "12px", marginBottom: "26px" }}>
              {examples.map((example) => (
                <div key={example} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "14px",
                }}>
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "8px",
                    background: "rgba(59,193,168,0.22)",
                    color: "#3BC1A8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    +
                  </span>
                  {example}
                </div>
              ))}
            </div>

            <p style={{ margin: "0 0 14px", color: "white", fontSize: "17px", fontWeight: 700 }}>
              How it helps:
            </p>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "12px" }}>
              {steps.map((step, index) => (
                <li key={step} style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: "12px",
                  alignItems: "center",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "14px",
                }}>
                  <span style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "rgba(0,84,97,0.42)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                  }}>
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </aside>
        </section>

        <p style={{
          margin: "42px 0 0",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.55)",
          maxWidth: "760px",
        }}>
          Kasulatan is a documentation tool, not a law firm or a substitute for legal advice. For serious disputes or
          high-value transactions, consult a qualified lawyer.
        </p>
      </div>
    </main>
  );
}
