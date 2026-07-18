import logoutUser from "@/app/logout/action";

export default function Logout() {
  return (
    <form>
      <button
        type="submit"
        formAction={logoutUser}
        className="site-logout-button"
        aria-label="Log out of Kasulatan"
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
