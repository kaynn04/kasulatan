import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import CreateAgreementForm from "./CreateAgreementForm";

export default async function NewAgreementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main style={{
      minHeight: "calc(100vh - 64px)",
      background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
      padding: "48px 24px",
      margin: 0,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
    }}>

      {/* Decorative circles */}
      <span style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(59,193,168,0.12)", pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(0,84,97,0.3)", pointerEvents: "none" }} />

      {/* Floating card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        background: "white",
        borderRadius: "24px",
        padding: "48px 44px",
        width: "100%",
        maxWidth: "620px",
        boxShadow: "0 32px 80px rgba(0,84,97,0.4), 0 8px 24px rgba(0,84,97,0.2)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <span style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "#0C7779",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </span>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#005461", margin: 0 }}>
              Create Agreement
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#99a1af", fontWeight: 300 }}>
              Fill in the details to draft a new agreement
            </p>
          </div>
        </div>

        <CreateAgreementForm />

      </div>
    </main>
  );
}