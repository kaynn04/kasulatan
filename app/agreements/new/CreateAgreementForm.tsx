"use client";

import { useActionState, useState } from "react";
import { createAgreement } from "./actions";
import styles from "../workflow.module.css";

type AgreementType = "LOAN" | "SALE" | "SWAP" | "SERVICE";

type CreateAgreementState = {
  success: boolean;
  errors: {
    title?: string;
    agreementType?: string;
    subjectMatter?: string;
    amount?: string;
    dueDate?: string;
    paymentTerms?: string;
    termsText?: string;
    counterPartyEmail?: string;
  };
};

const initialState: CreateAgreementState = { success: false, errors: {} };

const typeHelp: Record<AgreementType, {
  subjectPlaceholder: string;
  paymentPlaceholder: string;
  termsPlaceholder: string;
  dueLabel: string;
}> = {
  LOAN: {
    subjectPlaceholder: "e.g. Personal loan for emergency expenses",
    paymentPlaceholder: "e.g. PHP 2,000 every 15th and 30th until fully paid",
    termsPlaceholder: "Include the release date, repayment schedule, interest if any, late-payment terms, and proof of payment.",
    dueLabel: "Repayment due date",
  },
  SALE: {
    subjectPlaceholder: "e.g. Secondhand iPhone 13, 128GB, blue",
    paymentPlaceholder: "e.g. Full payment by GCash before pickup",
    termsPlaceholder: "Include item condition, accessories, delivery or pickup details, warranty, return, or no-return terms.",
    dueLabel: "Delivery or handover date",
  },
  SWAP: {
    subjectPlaceholder: "e.g. Laptop exchanged for phone plus cash",
    paymentPlaceholder: "e.g. Item-for-item exchange on the handover date",
    termsPlaceholder: "Include both items or services, condition, value, handover place, and what happens if one side cannot deliver.",
    dueLabel: "Exchange date",
  },
  SERVICE: {
    subjectPlaceholder: "e.g. Logo design and social media templates",
    paymentPlaceholder: "e.g. 50% upfront, 50% after final files are delivered",
    termsPlaceholder: "Include scope, deadline, deliverables, revisions, cancellation terms, and the acceptance process.",
    dueLabel: "Completion date",
  },
};

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.fieldLabel}>{label}</label>
      {children}
      {hint && !error && <p className={styles.fieldHint}>{hint}</p>}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function CreateAgreementForm() {
  const [state, action, pending] = useActionState(createAgreement, initialState);
  const [agreementType, setAgreementType] = useState<AgreementType>("LOAN");
  const errors = state?.errors ?? {};
  const help = typeHelp[agreementType];

  return (
    <form action={action} className={styles.form}>
      <Section title="Transaction basics" description="Choose the agreement type, value, and the main subject both parties are agreeing on.">
        <div className={styles.twoColumn}>
          <Field label="Agreement type" htmlFor="agreementType" error={errors.agreementType}>
            <select
              className={styles.control}
              id="agreementType"
              name="agreementType"
              value={agreementType}
              onChange={(event) => setAgreementType(event.target.value as AgreementType)}
            >
              <option value="LOAN">Loan</option>
              <option value="SALE">Sale</option>
              <option value="SWAP">Swap</option>
              <option value="SERVICE">Service</option>
            </select>
          </Field>

          <Field label="Amount (PHP)" htmlFor="amount" error={errors.amount} hint="For swaps, use the agreed estimated value.">
            <input className={styles.control} id="amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" />
          </Field>
        </div>

        <Field label="Agreement title" htmlFor="title" error={errors.title}>
          <input className={styles.control} id="title" name="title" type="text" placeholder="e.g. Loan agreement with Maria Santos" />
        </Field>

        <Field label="Subject matter" htmlFor="subjectMatter" error={errors.subjectMatter} hint="Be specific enough to identify this transaction later.">
          <input className={styles.control} id="subjectMatter" name="subjectMatter" type="text" placeholder={help.subjectPlaceholder} />
        </Field>
      </Section>

      <Section title="Dates and payment" description="Use clear dates and payment terms that both sides can verify.">
        <div className={styles.twoColumn}>
          <Field label={help.dueLabel} htmlFor="dueDate" error={errors.dueDate} hint="Optional, but recommended for time-bound arrangements.">
            <input className={styles.control} id="dueDate" name="dueDate" type="date" />
          </Field>

          <Field label="Payment terms" htmlFor="paymentTerms" error={errors.paymentTerms}>
            <input className={styles.control} id="paymentTerms" name="paymentTerms" placeholder={help.paymentPlaceholder} />
          </Field>
        </div>
      </Section>

      <Section title="Full agreement terms" description="State what each side must do, what counts as completion, and what happens if plans change.">
        <Field label="Terms and conditions" htmlFor="termsText" error={errors.termsText} hint={help.termsPlaceholder}>
          <textarea className={`${styles.control} ${styles.textarea}`} id="termsText" name="termsText" placeholder="Write the complete terms both parties should review before signing." />
        </Field>
      </Section>

      <Section title="Counterparty account" description="Their registered profile details will be copied into the agreement record.">
        <Field label="Counterparty email" htmlFor="counterPartyEmail" error={errors.counterPartyEmail} hint="Enter the email connected to their Kasulatan account.">
          <input className={styles.control} id="counterPartyEmail" name="counterPartyEmail" type="email" placeholder="counterparty@example.com" />
        </Field>
      </Section>

      <div className={styles.formFooter}>
        <p>The agreement will be saved as a draft and will move through the counterparty and creator signing steps.</p>
        <button type="submit" disabled={pending} className={styles.submitButton}>
          {pending ? "Creating…" : "Create agreement"}
        </button>
      </div>
    </form>
  );
}
