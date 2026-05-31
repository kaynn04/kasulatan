import logoutUser from "@/app/logout/action";

type LogoutProps = {
  variant?: "light" | "dark";
};

export default function Logout({ variant = "light" }: LogoutProps) {
  const isDark = variant === "dark";

  return (
    <form>
      <button
        type="submit"
        formAction={logoutUser}
        className="site-logout-button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 20px",
          borderRadius: "10px",
          border: isDark ? "1.5px solid #d1d5db" : "1.5px solid rgba(255,255,255,0.25)",
          background: isDark ? "white" : "transparent",
          color: isDark ? "#374151" : "rgba(255,255,255,0.85)",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </form>
  );
}
