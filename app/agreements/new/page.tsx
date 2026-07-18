import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import CreateAgreementForm from "./CreateAgreementForm";
import styles from "../workflow.module.css";

function CheckItem({ children }: { children: string }) {
  return (
    <div className={styles.checkItem}>
      <span className={styles.checkMark} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4L6.5 11 3 7.5" />
        </svg>
      </span>
      <p>{children}</p>
    </div>
  );
}

export default async function NewAgreementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className={`${styles.page} workspace-page`}>
      <div className={styles.container}>
        <Link href="/agreements" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Back to agreements
        </Link>

        <section className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>New agreement</span>
            <h1 className={styles.title}>Put the terms in writing before the transaction begins.</h1>
            <p className={styles.lede}>
              Capture the value, deadline, responsibilities, and counterparty details in one record both sides can review.
            </p>
          </div>

          <aside className={styles.darkCard}>
            <h2>Before you start</h2>
            <p>The other party needs a Kasulatan account. We securely match their account using the email they registered.</p>
          </aside>
        </section>

        <section className={styles.layout}>
          <div className={styles.card}>
            <CreateAgreementForm />
          </div>

          <aside className={`${styles.asideStack} ${styles.stickyAside}`}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Useful details to include</h2>
              <p className={styles.bodyText}>Specific details make the record easier for both sides to verify later.</p>
              <div className={styles.checklist}>
                <CheckItem>Names and current contact details</CheckItem>
                <CheckItem>Amount, item, service, or exchange details</CheckItem>
                <CheckItem>Repayment, delivery, or completion date</CheckItem>
                <CheckItem>Payment method and installment schedule</CheckItem>
                <CheckItem>What happens if plans change or are cancelled</CheckItem>
              </div>
            </section>

            <section className={styles.warningCard}>
              <h2>Keep it specific</h2>
              <p>Avoid phrases like “pay soon” or “good condition.” Use exact dates, amounts, descriptions, and responsibilities.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
