import Link from "next/link";
import { getSession } from "@/lib/session";
import Logout from "@/components/Logout";
import ThemeToggle from "@/components/ThemeToggle";

const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agreements", label: "Agreements" },
];

const publicLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/#what-is-recorded", label: "What is recorded" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="site-nav-link"
      style={{
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
  const navLinks = session ? authenticatedLinks : publicLinks;
  const initials = session?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={`site-header ${session ? "site-header-authenticated" : "site-header-public"}`}>
      <div className="site-header-inner">
        <Link href={session ? "/dashboard" : "/"} className="site-brand-link" style={{ textDecoration: "none" }}>
          <span className="site-brand-mark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="site-brand-text">
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
          <ThemeToggle />
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
