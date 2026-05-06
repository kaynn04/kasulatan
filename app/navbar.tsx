"use client";

import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agreements", label: "Agreements" },
  { href: "/agreements/new", label: "New Agreement" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        color: "rgba(255,255,255,0.75)",
        textDecoration: "none",
        fontSize: "20px",
        fontWeight: 500,
        padding: "6px 30px",
        borderRadius: "8px",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(59,193,168,0.15)";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
      }}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  return (
    <header style={{
      background: "#005461",
      borderBottom: "1px solid rgba(59,193,168,0.15)",
      padding: "0 90px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "100px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 16px rgba(0,84,97,0.3)",
    }}>

      {/* Brand */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "#3BC1A8",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
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
          fontSize: "40px",
          color: "white",
          letterSpacing: "0.03em",
        }}>
          Kasulatan
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {navLinks.map(({ href, label }) => (
          <NavLink key={href} href={href} label={label} />
        ))}
      </nav>

      {/* Auth buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          href="/login"
          style={{
            color: "rgba(255,255,255,0.85)",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: 500,
            padding: "7px 18px",
            borderRadius: "8px",
            border: "1.5px solid rgba(59,193,168,0.4)",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#3BC1A8";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(59,193,168,0.4)";
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }}
        >
          Login
        </Link>

        <Link
          href="/register"
          style={{
            color: "#005461",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: 600,
            padding: "7px 18px",
            borderRadius: "8px",
            background: "#3BC1A8",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#249E94";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#3BC1A8";
          }}
        >
          Register
        </Link>
      </div>

    </header>
  );
}