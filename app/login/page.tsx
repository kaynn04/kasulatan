import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to review, create, and manage your Kasulatan agreements.",
};

const returnToItems = [
  {
    title: "Your active agreements",
    description: "See which records need your review or signature.",
  },
  {
    title: "One shared version",
    description: "Return to the same terms and party details both sides reviewed.",
  },
  {
    title: "Printable records",
    description: "Open finalized summaries and keep a copy for reference.",
  },
];

export default function LoginPage() {
  return (
    <main className={`${styles.page} auth-page`}>
      <div className={styles.pageTexture} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.pageIntro}>
          <div>
            <span className={styles.kicker}>Welcome back</span>
            <h1>Continue where the agreement left off.</h1>
          </div>
          <p>
            Sign in to review terms, complete a signature, or return to the records you have already created.
          </p>
        </div>

        <div className={`${styles.layout} ${styles.loginLayout}`}>
          <section className={styles.formCard} aria-labelledby="login-form-title">
            <div className={styles.formCardHeader}>
              <span className={styles.documentMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 3h7l4 4v14H7z" />
                  <path d="M14 3v5h5M10 13h6M10 17h6" />
                </svg>
              </span>
              <div>
                <h2 id="login-form-title">Sign in to Kasulatan</h2>
                <p>Use the email and password connected to your agreements.</p>
              </div>
            </div>

            <LoginForm />

            <p className={styles.accountSwitch}>
              New to Kasulatan? <Link href="/register">Create an account</Link>
            </p>
          </section>

          <aside className={styles.aside} aria-label="What you can access after signing in">
            <div className={styles.asidePrimary}>
              <span className={styles.asideKicker}>When you return</span>
              <h2>Your agreements stay organized around the next action.</h2>
              <div className={styles.infoList}>
                {returnToItems.map((item, index) => (
                  <div key={item.title} className={styles.infoItem}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.securityNote}>
              <span className={styles.securityIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
              <div>
                <strong>Your password is never stored as plain text.</strong>
                <p>Sign-in attempts are rate-limited, and the session cookie is protected from browser scripts.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
