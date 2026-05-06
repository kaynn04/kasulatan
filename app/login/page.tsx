import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{
      minHeight: "calc(100vh - 64px)",
      padding: 0,
      margin: 0,
      background: "linear-gradient(135deg, #005461 0%, #0C7779 40%, #249E94 75%, #3BC1A8 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
        position: "absolute", top: "20%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(36,158,148,0.15)", pointerEvents: "none",
      }} />

      {/* Floating card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        background: "white",
        borderRadius: "24px",
        padding: "48px 44px",
        width: "100%",
        maxWidth: "700px",
        margin: "40px 24px",
        marginTop: "-70px",
        boxShadow: "0 32px 80px rgba(0,84,97,0.4), 0 8px 24px rgba(0,84,97,0.2)",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <span style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#0C7779",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "-10px",

          }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "45px", color: "#005461", 
            letterSpacing: "0.03em",
            marginBottom: "-10px",
          }}>
            Kasulatan
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "28px", color: "#005461",
          margin: "0 2px 10px 2px",
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "18px", color: "#99a1af", margin: "0 0 32px", fontWeight: 300 }}>
          Sign in to your Kasulatan account
        </p>

        <LoginForm />

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "12.5px", color: "#99a1af" }}>
          Don&apos;t have an account?{" "}
          <Link href="./register" style={{ color: "#0C7779", fontWeight: 500, textDecoration: "none" }}>
            Register
          </Link>
        </p>

      </div>
    </main>
  );
}