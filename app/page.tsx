import PageIntro from "@/components/PageIntro";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const userCount = await prisma.user.count();

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
        position: "absolute", top: "30%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(36,158,148,0.15)", pointerEvents: "none",
      }} />

      {/* Centered content */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "680px",
        padding: "80px 40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>

        {/* Trust badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(59,193,168,0.15)",
          border: "1px solid rgba(59,193,168,0.3)",
          borderRadius: "9999px",
          padding: "6px 16px",
          marginBottom: "32px",
        }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#3BC1A8", flexShrink: 0,
          }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            {userCount.toLocaleString()} users trust Kasulatan
          </span>
        </div>

        <PageIntro
          title="Welcome to Kasulatan"
          description="Secure digital platform that enables users to create, sign, and manage agreements — anytime, anywhere."
        />

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" style={{
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
            Get started free
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>

          <Link href="/agreements" style={{
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
            View agreements
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {[
            "✦ Free for first 3 agreements",
            "✦ Digital signatures",
            "✦ Secure & encrypted",
          ].map((f) => (
            <span key={f} style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.55)",
            }}>
              {f}
            </span>
          ))}
        </div>

      </div>
    </main>
  );
}