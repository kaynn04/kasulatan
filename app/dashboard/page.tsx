import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import PageIntro from "@/components/PageIntro";
import Logout from "@/components/Logout";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main style={{
      minHeight: "calc(100vh - 64px)",
      background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
      padding: 0,
      margin: 0,
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

      {/* Page content */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: "48px 64px",
      }}>

        {/* Top bar — heading + logout */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}>
          <PageIntro
            title="Dashboard"
            description="Manage your agreements and transactions here."
          />
          <Logout />
        </div>

        {/* Stat cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "32px",
        }}>
          {[
            {
              label: "Total Agreements",
              value: "0",
              icon: (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3BC1A8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
            },
            {
              label: "Pending Signatures",
              value: "0",
              icon: (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3BC1A8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
            },
            {
              label: "Completed",
              value: "0",
              icon: (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3BC1A8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
            },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "24px",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}>
              <span style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(59,193,168,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {icon}
              </span>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 700, color: "white", lineHeight: 1 }}>{value}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "28px 32px",
          backdropFilter: "blur(8px)",
        }}>
          <p style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "white" }}>
            Quick Actions
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "New Agreement", href: "/agreements/new" },
              { label: "View All Agreements", href: "/agreements" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: label === "New Agreement" ? "#3BC1A8" : "rgba(255,255,255,0.1)",
                color: label === "New Agreement" ? "#005461" : "white",
                fontWeight: label === "New Agreement" ? 700 : 500,
                fontSize: "14px",
                textDecoration: "none",
                border: label === "New Agreement" ? "none" : "1px solid rgba(255,255,255,0.2)",
              }}>
                {label === "New Agreement" && (
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="2" x2="8" y2="14" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                  </svg>
                )}
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}