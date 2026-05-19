import Link from "next/link";
import { getSession } from "@/lib/session";
import Logout from "@/components/Logout";

const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agreements", label: "Agreements" },
  { href: "/agreements/new", label: "New" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="site-nav-link"
      style={{
        color: "#475569",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 700,
        padding: "8px 12px",
        borderRadius: "8px",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {label}
    </Link>
  );
}

export default async function Navbar() {
  const session = await getSession();
  const navLinks = session ? authenticatedLinks : [];
  const initials = session?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="site-header" style={{
      background: session ? "rgba(255,255,255,0.96)" : "rgba(0,84,97,0.96)",
      borderBottom: session ? "1px solid #e5e7eb" : "1px solid rgba(59,193,168,0.15)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: session ? "0 1px 18px rgba(15,23,42,0.06)" : "0 2px 16px rgba(0,84,97,0.3)",
      backdropFilter: "blur(12px)",
    }}>
      <div className="site-header-inner">
        <Link href="/" className="site-brand-link" style={{ textDecoration: "none" }}>
          <span className="site-brand-mark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="site-brand-text" style={{
            fontFamily: "'DM Serif Display', serif",
            color: session ? "#005461" : "white",
          }}>
            Kasulatan
          </span>
        </Link>

        {navLinks.length > 0 && (
          <nav className="site-main-nav" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
          </nav>
        )}

        <div className="site-header-actions">
          {session ? (
            <>
              <div className="site-user-chip">
                <span className="site-user-avatar">
                  {initials}
                </span>
                <span className="site-user-copy">
                  <span className="site-user-name">
                    {session.name}
                  </span>
                  <span className="site-user-email">
                    {session.email}
                  </span>
                </span>
              </div>
              <Logout variant="dark" />
            </>
          ) : (
            <>
              <Link href="/login" className="site-auth-link">
                Login
              </Link>
              <Link href="/register" className="site-register-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
