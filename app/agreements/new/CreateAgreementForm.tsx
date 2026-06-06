"use client";

import { useActionState, useState } from "react";
import { createAgreement } from "./actions";

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

const initialState: CreateAgreementState = {
  success: false,
  errors: {},
};

const typeHelp: Record<AgreementType, {
  subjectPlaceholder: string;
  paymentPlaceholder: string;
  termsPlaceholder: string;
  dueLabel: string;
}> = {
  LOAN: {
    subjectPlaceholder: "e.g. Personal loan for emergency expenses",
    paymentPlaceholder: "e.g. PHP 2,000 every 15th and 30th until fully paid",
    termsPlaceholder: "Include release date, repayment schedule, interest if any, late payment terms, and proof of payment.",
    dueLabel: "Repayment Due Date",
  },
  SALE: {
    subjectPlaceholder: "e.g. Secondhand iPhone 13, 128GB, blue",
    paymentPlaceholder: "e.g. Full payment by GCash before pickup",
    termsPlaceholder: "Include item condition, included accessories, delivery or pickup details, warranty, return, or no-return terms.",
    dueLabel: "Delivery / Handover Date",
  },
  SWAP: {
    subjectPlaceholder: "e.g. Laptop exchanged for phone plus cash",
    paymentPlaceholder: "e.g. No cash payment, item-for-item exchange on handover date",
    termsPlaceholder: "Include both items or services, condition, estimated value, handover place, and what happens if one side cannot deliver.",
    dueLabel: "Exchange Date",
  },
  SERVICE: {
    subjectPlaceholder: "e.g. Logo design and social media templates",
    paymentPlaceholder: "e.g. 50% upfront, 50% after final files are delivered",
    termsPlaceholder: "Include scope of work, deadline, deliverables, revisions, cancellation terms, and acceptance process.",
    dueLabel: "Completion Date",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label htmlFor={htmlFor} style={{
        fontSize: "12px",
        fontWeight: 800,
        color: "#334155",
      }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#dc2626", margin: 0 }}>
          <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true">
            <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 9a.75.75 0 110-1.5A.75.75 0 016 9zm.75-3.75a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0v2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: "grid", gap: "18px" }}>
      <div>
        <h2 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "18px", fontWeight: 900 }}>
          {title}
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.55 }}>
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #dbe3ea",
  background: "white",
  padding: "11px 12px",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export default function CreateAgreementForm() {
  const [state, action, pending] = useActionState(createAgreement, initialState);
  const [agreementType, setAgreementType] = useState<AgreementType>("LOAN");
  const errors = state?.errors ?? {};
  const help = typeHelp[agreementType];

  return (
    <form action={action} style={{ display: "grid", gap: "28px" }}>
      <Section
        title="Transaction basics"
        description="Start with the kind of agreement, the value involved, and the main thing being agreed on."
      >
        <div className="new-agreement-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Agreement Type" htmlFor="agreementType" error={errors.agreementType}>
            <select
              style={selectStyle}
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

          <Field label="Amount (PHP)" htmlFor="amount" error={errors.amount} hint="Enter the agreed cash value. For swaps, use the estimated value of the exchange.">
            <input style={inputStyle} id="amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" />
          </Field>
        </div>

        <Field label="Agreement Title" htmlFor="title" error={errors.title}>
          <input style={inputStyle} id="title" name="title" type="text" placeholder="e.g. Loan agreement with Maria Santos" />
        </Field>

        <Field label="Subject Matter" htmlFor="subjectMatter" error={errors.subjectMatter} hint="Be specific enough that both parties can identify the transaction later.">
          <input style={inputStyle} id="subjectMatter" name="subjectMatter" type="text" placeholder={help.subjectPlaceholder} />
        </Field>
      </Section>

      <Section
        title="Dates and payment"
        description="Clear dates and payment terms make informal arrangements easier to verify later."
      >
        <div className="new-agreement-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label={help.dueLabel} htmlFor="dueDate" error={errors.dueDate} hint="Optional, but recommended when money, delivery, or work is time-bound.">
            <input style={inputStyle} id="dueDate" name="dueDate" type="date" />
          </Field>

          <Field label="Payment Terms" htmlFor="paymentTerms" error={errors.paymentTerms}>
            <input style={inputStyle} id="paymentTerms" name="paymentTerms" placeholder={help.paymentPlaceholder} />
          </Field>
        </div>
      </Section>

      <Section
        title="Full agreement terms"
        description="Write what each side promises to do, what counts as completion, and what happens if plans change."
      >
        <Field label="Terms and Conditions" htmlFor="termsText" error={errors.termsText} hint={help.termsPlaceholder}>
          <textarea
            style={{ ...inputStyle, minHeight: "170px", resize: "vertical", lineHeight: 1.65 }}
            id="termsText"
            name="termsText"
            placeholder="Write the complete terms both parties should review before signing."
          />
        </Field>
      </Section>

      <Section
        title="Counterparty account"
        description="Enter the counterparty email. Their registered name, mobile number, and address will be copied into the agreement."
      >
        <Field label="Counterparty Email" htmlFor="counterPartyEmail" error={errors.counterPartyEmail} hint="This is used to find their Kasulatan account.">
          <input style={inputStyle} id="counterPartyEmail" name="counterPartyEmail" type="email" placeholder="counterparty@example.com" />
        </Field>
      </Section>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        borderTop: "1px solid #e5e7eb",
        paddingTop: "22px",
      }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
          The agreement will be saved as a draft record and sent through the signing flow.
        </p>
        <button
          type="submit"
          disabled={pending}
          style={{
            minWidth: "180px",
            padding: "12px 18px",
            borderRadius: "10px",
            border: "none",
            background: pending ? "#249E94" : "#005461",
            color: "white",
            fontSize: "14px",
            fontWeight: 900,
            fontFamily: "inherit",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.72 : 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {pending ? "Creating..." : "Create agreement"}
        </button>
      </div>
    </form>
  );
}
