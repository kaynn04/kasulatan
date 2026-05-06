import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default async function RegisterUserPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <span style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "rgba(59,193,168,0.15)", pointerEvents: "none",
      }} />
      <span style={{
        position: "absolute", bottom: "-80px", right: "30%",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "rgba(0,84,97,0.3)", pointerEvents: "none",
      }} />
      <span style={{
        position: "absolute", top: "20%", right: "-60px",
        width: "220px", height: "220px", borderRadius: "50%",
        background: "rgba(36,158,148,0.2)", pointerEvents: "none",
      }} />

      {/* Inner layout */}
      <div style={{
        width: "100%",
        display: "flex",
        alignItems: "stretch",
        padding: "60px 64px",
        gap: "48px",
        position: "relative",
        zIndex: 1,
        marginTop: "-70px",
        }}>

        {/* Left — hero text */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingRight: "1px",   
          paddingLeft: "300px",       
          marginLeft: "100px",
    
           }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
            <span style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "#3BC1A8", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "22px", color: "white", letterSpacing: "0.04em",
            }}>
              Kasulatan
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "52px", lineHeight: 1.15,
            color: "white", margin: "0 0 20px",
          }}>
            Your Digital Space<br />for Trusted<br />Agreements.
          </h1>

          <p style={{
            fontSize: "15px", lineHeight: 1.75,
            color: "rgba(255,255,255,0.75)",
            margin: "0 0 36px", maxWidth: "420px",
          }}>
            Kasulatan is a secure digital platform that enables users to create,
            sign, and manage agreements — anytime, anywhere.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              "Make digital agreements anytime and anywhere",
              "Secure your agreements with signature",
              "Free for your first 3 agreements",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.9)", fontSize: "15px" }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 8 6 12 14 4" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — floating form card */}
        <div style={{
          flex: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "250px",
        }}>
          <div style={{
            width: "100%",
            maxWidth: "780px",
            background: "white",
            borderRadius: "24px",
            padding: "48px 44px",
            boxShadow: "0 32px 80px rgba(0,84,97,0.4), 0 8px 24px rgba(0,84,97,0.2)",
          }}>
            {/* Step dots */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
              <span style={{ width: "20px", height: "6px", borderRadius: "9999px", background: "#0C7779" }} />
              <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "rgba(12,119,121,0.25)" }} />
              <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "rgba(12,119,121,0.25)" }} />
            </div>

            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "28px", color: "#005461", margin: "0 0 6px",
            }}>
              Create account
            </h2>
            <p style={{ fontSize: "13px", color: "#99a1af", margin: "0 0 32px", fontWeight: 300 }}>
              Fill in your details to get started
            </p>

            <RegisterForm />

            <p style={{ marginTop: "24px", textAlign: "center", fontSize: "12.5px", color: "#99a1af" }}>
              Already have an account?{" "}
              <Link href="./login" style={{ color: "#0C7779", fontWeight: 500, textDecoration: "none" }}>
                Login
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}