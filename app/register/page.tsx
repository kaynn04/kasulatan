import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./RegisterForm";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Kasulatan identity profile for clearer digital agreements.",
};

const collectedInformation = [
  {
    title: "Legal name",
    description: "Used for party labels and typed-signature matching.",
  },
  {
    title: "Contact details",
    description: "Help identify the right person in a two-party record.",
  },
  {
    title: "Registered address",
    description: "Reused in agreements involving delivery, lending, or handover.",
  },
  {
    title: "Account credentials",
    description: "Keep your agreements available only through your account.",
  },
];

export default function RegisterUserPage() {
  return (
    <main className={`${styles.page} auth-page`}>
      <div className={styles.pageTexture} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.pageIntro}>
          <div>
            <span className={styles.kicker}>Create your identity profile</span>
            <h1>Use consistent details in every agreement.</h1>
          </div>
          <p>
            Set up the name, contact information, and address that will identify you when you create or sign a Kasulatan.
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.formCard} aria-labelledby="register-form-title">
            <div className={styles.formCardHeader}>
              <span className={styles.documentMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 3h7l4 4v14H7z" />
                  <path d="M14 3v5h5M10 13h6M10 17h6" />
                </svg>
              </span>
              <div>
                <h2 id="register-form-title">Create your Kasulatan account</h2>
                <p>Enter accurate details that you are comfortable including in agreement records.</p>
              </div>
            </div>

            <RegisterForm />

            <p className={styles.accountSwitch}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </section>

          <aside className={styles.aside} aria-label="Why registration information is collected">
            <div className={styles.asidePrimary}>
              <span className={styles.asideKicker}>Why these details matter</span>
              <h2>A clearer record begins with identifiable parties.</h2>
              <p className={styles.asideLead}>
                Agreements are more useful when both sides can understand who participated and how to contact them.
              </p>
              <div className={styles.infoList}>
                {collectedInformation.map((item, index) => (
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

            <div className={styles.accuracyNote}>
              <span aria-hidden="true">✦</span>
              <div>
                <strong>Accuracy protects both parties.</strong>
                <p>Use information that reasonably identifies you. Avoid nicknames unless they form part of your legal name.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
