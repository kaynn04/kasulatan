import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default async function RegisterUserPage() {
  return (
    <main style={{
      minHeight: "calc(100vh - 100px)",
      background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
      padding: "40px 32px 56px",
      position: "relative",
      overflow: "hidden",
    }}>
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
        position: "absolute", top: "20%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(36,158,148,0.15)", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <section className="register-page-head" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "24px",
          alignItems: "end",
          marginBottom: "24px",
        }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#3BC1A8", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>
              Create Account
            </p>
            <h1 style={{
              margin: "0 0 10px",
              color: "white",
              fontFamily: "'DM Serif Display', serif",
              fontSize: "42px",
              lineHeight: 1.1,
            }}>
              Set up the identity details your agreements will use.
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontSize: "16px", lineHeight: 1.65, maxWidth: "720px" }}>
              Kasulatan uses your registered name, contact number, and address when you create or sign agreements.
              This keeps party details consistent and avoids retyping locations later.
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.09)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "16px",
            padding: "20px",
            backdropFilter: "blur(10px)",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 900 }}>
              Why ask for address now?
            </p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", fontSize: "14px", lineHeight: 1.6 }}>
              For loans, deliveries, handovers, and family transactions, location helps identify the parties in the record.
            </p>
          </div>
        </section>

        <section className="register-layout" style={{
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
            <RegisterForm />

            <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#005461", fontWeight: 900, textDecoration: "none" }}>
                Login
              </Link>
            </p>
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{
              background: "rgba(255,255,255,0.09)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "16px",
              padding: "22px",
              backdropFilter: "blur(10px)",
            }}>
              <p style={{ margin: "0 0 8px", color: "white", fontSize: "17px", fontWeight: 900 }}>
                Information we collect
              </p>
              <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.68)", fontSize: "13px", lineHeight: 1.6 }}>
                These details support clearer records when both parties agree to a transaction.
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  "Full legal name for signatures and party labels",
                  "Mobile number for contact and identity reference",
                  "Registered address for agreements and handovers",
                  "Email and password for secure account access",
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
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: "14px", lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "rgba(255,247,237,0.92)",
              border: "1px solid rgba(254,215,170,0.9)",
              borderRadius: "16px",
              padding: "22px",
            }}>
              <p style={{ margin: "0 0 8px", color: "#7c2d12", fontSize: "17px", fontWeight: 900 }}>
                Keep it accurate
              </p>
              <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", lineHeight: 1.65 }}>
                Use information that can reasonably identify you in a real transaction. Avoid nicknames unless they are part of your legal name.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
