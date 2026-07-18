import Link from "next/link";
import TiltedCard from "@/components/TiltedCard";
import { getSession } from "@/lib/session";
import styles from "./landing.module.css";

const howItWorks = [
  {
    number: "01",
    title: "Write the agreement",
    description: "Choose the transaction type, add the amount, due date, responsibilities, and the other party.",
  },
  {
    number: "02",
    title: "Review together",
    description: "Both parties see the same terms before signing, so unclear details can be corrected early.",
  },
  {
    number: "03",
    title: "Sign and keep a copy",
    description: "Capture consent, signatures, timestamps, and a printable record that both sides can return to.",
  },
];

const useCases = [
  {
    icon: "₱",
    title: "Loans and payment promises",
    description: "Record the amount, schedule, due date, and repayment expectations between people you know.",
  },
  {
    icon: "↔",
    title: "Sales and item swaps",
    description: "Describe what changes hands, its condition, the agreed price, and when delivery happens.",
  },
  {
    icon: "✦",
    title: "Freelance and services",
    description: "Set the scope, fee, deliverables, timeline, and payment terms before the work begins.",
  },
  {
    icon: "⌂",
    title: "Family arrangements",
    description: "Turn an important verbal understanding into a respectful record everyone can revisit.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const primaryHref = session ? "/dashboard" : "/register";

  return (
    <main className={`${styles.page} landing-page`}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowMark} aria-hidden="true">✦</span>
                Built for everyday agreements in the Philippines
              </div>

              <h1 className={styles.heroTitle}>
                Usapan ngayon.
                <span>Kasulatang maaasahan.</span>
              </h1>

              <p className={styles.heroLead}>
                Turn a verbal or chat-based deal into a clear written record that both parties can review, sign, and keep.
              </p>

              <div className={styles.heroActions}>
                <Link href={primaryHref} className={styles.primaryButton}>
                  {session ? "Go to dashboard" : "Create your kasulatan"}
                  <ArrowIcon />
                </Link>
                <Link href="#how-it-works" className={styles.secondaryButton}>
                  See how it works
                </Link>
              </div>

              <div className={styles.heroAssurances} aria-label="Product assurances">
                <span><CheckIcon /> Two-party review</span>
                <span><CheckIcon /> Electronic signatures</span>
                <span><CheckIcon /> Printable record</span>
              </div>
            </div>

            <div className={styles.previewWrap} aria-label="Example Kasulatan agreement record">
              <TiltedCard rotateAmplitude={7} scaleOnHover={1.025}>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewBrand}>
                      <span className={styles.previewLogo} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 3h7l4 4v14H7z" />
                          <path d="M14 3v5h5M10 13h6M10 17h6" />
                        </svg>
                      </span>
                      <span>Kasulatan</span>
                    </div>
                    <span className={styles.statusPill}>Ready to sign</span>
                  </div>

                  <div className={styles.previewBody}>
                    <div className={styles.previewMeta}>
                      <span>LOAN AGREEMENT</span>
                      <span>KAS-20260717-A8F2</span>
                    </div>
                    <h2>Personal loan for school expenses</h2>
                    <p>Clear terms between two parties, recorded before funds are transferred.</p>

                    <div className={styles.amountRow}>
                      <div>
                        <span className={styles.fieldLabel}>AGREED AMOUNT</span>
                        <strong>₱25,000.00</strong>
                      </div>
                      <div>
                        <span className={styles.fieldLabel}>DUE DATE</span>
                        <strong>30 Sep 2026</strong>
                      </div>
                    </div>

                    <div className={styles.partyList}>
                      <div className={styles.partyRow}>
                        <span className={styles.avatar}>MA</span>
                        <span><strong>Maria A.</strong><small>Creator · reviewed</small></span>
                        <span className={styles.reviewed}><CheckIcon /></span>
                      </div>
                      <div className={styles.partyRow}>
                        <span className={`${styles.avatar} ${styles.avatarAlt}`}>JR</span>
                        <span><strong>Jose R.</strong><small>Counterparty · invited</small></span>
                        <span className={styles.pendingDot} aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.previewFooter}>
                    <span className={styles.recordIcon} aria-hidden="true">✓</span>
                    <span><strong>Activity recorded</strong><small>Identity, consent, and timestamps</small></span>
                  </div>
                </div>
              </TiltedCard>
              <div className={styles.floatingNote}>
                <span aria-hidden="true">✓</span>
                <div><strong>Terms reviewed</strong><small>Both parties see one record</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.promiseStrip} aria-label="Kasulatan product principles">
        <div className={`${styles.container} ${styles.promiseGrid}`}>
          <p><strong>Malinaw</strong><span>Important details in one place</span></p>
          <p><strong>May pagsang-ayon</strong><span>Review and consent from both sides</span></p>
          <p><strong>May babalikan</strong><span>A lasting record of what happened</span></p>
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>How it works</span>
              <h2>From conversation to clear agreement.</h2>
            </div>
            <p>
              Kasulatan guides both parties through the details that are easy to miss when a deal only lives in chat.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {howItWorks.map((step) => (
              <article key={step.number} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <div className={styles.stepLine} aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className={`${styles.section} ${styles.useCaseSection}`}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeading} ${styles.centeredHeading}`}>
            <div>
              <span className={styles.kicker}>Made for real life</span>
              <h2>A practical record for the deals people make every day.</h2>
            </div>
          </div>

          <div className={styles.useCaseGrid}>
            {useCases.map((useCase) => (
              <article key={useCase.title} className={styles.useCaseCard}>
                <span className={styles.useCaseIcon} aria-hidden="true">{useCase.icon}</span>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="what-is-recorded" className={styles.evidenceSection}>
        <div className={`${styles.container} ${styles.evidenceGrid}`}>
          <div className={styles.evidenceCopy}>
            <span className={styles.kicker}>More than a template</span>
            <h2>Keep the context behind every signature.</h2>
            <p>
              A useful agreement record includes more than names on a page. Kasulatan keeps the terms, parties, consent, and activity trail together.
            </p>
            <Link href={primaryHref} className={styles.textLink}>
              {session ? "Open your agreements" : "Start a clear agreement"} <ArrowIcon />
            </Link>
          </div>

          <div className={styles.evidenceList}>
            {[
              ["01", "Identity details", "Names and contact details connected to each party."],
              ["02", "Agreement terms", "Amount, dates, responsibilities, and the complete written terms."],
              ["03", "Consent and signatures", "Confirmation that each party reviewed and electronically signed."],
              ["04", "Activity trail", "Timestamps and key events kept with the agreement record."],
            ].map(([number, title, description]) => (
              <div key={number} className={styles.evidenceItem}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalSection}>
        <div className={styles.container}>
          <div className={styles.finalCard}>
            <span className={styles.kicker}>Clarity is a form of care</span>
            <h2>Put the agreement in writing before the transaction begins.</h2>
            <p>Take a few minutes now to give both parties something clear to rely on later.</p>
            <div className={styles.finalActions}>
              <Link href={primaryHref} className={styles.primaryButton}>
                {session ? "Go to dashboard" : "Create a free account"}
                <ArrowIcon />
              </Link>
              {!session && <Link href="/login" className={styles.finalSignIn}>Already have an account? Sign in</Link>}
            </div>
          </div>

          <footer className={styles.landingFooter}>
            <div>
              <strong>Kasulatan</strong>
              <span>Clear agreements for everyday transactions.</span>
            </div>
            <p>
              Kasulatan is a documentation tool, not a law firm or a substitute for legal advice. Consult a qualified lawyer for high-value or complex transactions.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
