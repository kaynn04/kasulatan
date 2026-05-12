import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AgreementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const agreements = await prisma.agreement.findMany({
    where: {
      OR: [
        { createdById: session.id },
        { parties: { some: { email: session.email, role: "COUNTERPARTY" } } },
      ],
    },
    include: { parties: true },
    orderBy: { createdAt: "desc" },
  });

  const createdByMe = agreements.filter((a) => a.createdById === session.id);
  const asCounterparty = agreements.filter((a) =>
    a.parties.some(
      (p) => p.role === "COUNTERPARTY" && p.email.toLowerCase() === session.email.toLowerCase()
    )
  );

  const AgreementCard = ({ agreement }: { agreement: typeof agreements[0] }) => (
    <Link
      href={`/agreements/${agreement.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 24px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "14px",
        textDecoration: "none",
        backdropFilter: "blur(8px)",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
        <span style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(59,193,168,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3BC1A8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agreement.title}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>
            {agreement.agreementType}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <span style={{
          background: "rgba(59,193,168,0.15)",
          border: "1px solid rgba(59,193,168,0.25)",
          borderRadius: "9999px",
          padding: "4px 12px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#3BC1A8",
          whiteSpace: "nowrap",
        }}>
          PHP {agreement.amount.toString()}
        </span>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </div>
    </Link>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      background: "rgba(255,255,255,0.05)",
      border: "1px dashed rgba(255,255,255,0.15)",
      borderRadius: "14px",
      gap: "12px",
    }}>
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>{message}</p>
    </div>
  );

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
      <span style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(59,193,168,0.12)", pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(0,84,97,0.3)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "48px 64px", maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "white", margin: "0 0 6px" }}>
              Agreements
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
              {agreements.length} total agreement{agreements.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/agreements/new" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#3BC1A8", color: "#005461",
            textDecoration: "none", fontSize: "14px", fontWeight: 700,
            padding: "10px 22px", borderRadius: "10px",
          }}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            New Agreement
          </Link>
        </div>

        {/* Created by Me */}
        <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "white", margin: 0 }}>
              Created by Me
            </h2>
            <span style={{
              background: "rgba(59,193,168,0.2)", color: "#3BC1A8",
              borderRadius: "9999px", padding: "2px 10px", fontSize: "12px", fontWeight: 600,
            }}>
              {createdByMe.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {createdByMe.length === 0
              ? <EmptyState message="No agreements created by you yet." />
              : createdByMe.map((a) => <AgreementCard key={a.id} agreement={a} />)
            }
          </div>
        </section>

        {/* As Counterparty */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "white", margin: 0 }}>
              Where I am Counterparty
            </h2>
            <span style={{
              background: "rgba(59,193,168,0.2)", color: "#3BC1A8",
              borderRadius: "9999px", padding: "2px 10px", fontSize: "12px", fontWeight: 600,
            }}>
              {asCounterparty.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {asCounterparty.length === 0
              ? <EmptyState message="No agreements where you are a counterparty." />
              : asCounterparty.map((a) => <AgreementCard key={a.id} agreement={a} />)
            }
          </div>
        </section>

      </div>
    </main>
  );
}