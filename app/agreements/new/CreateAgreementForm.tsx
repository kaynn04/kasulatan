"use client";

import { useActionState } from "react";
import { createAgreement } from "./actions";

type CreateAgreementState = {
  success: boolean;
  errors: {
    title?: string;
    agreementType?: string;
    subjectMatter?: string;
    amount?: string;
    paymentTerms?: string;
    termsText?: string;
    counterPartyEmail?: string;
  };
};

const initialState: CreateAgreementState = {
  success: false,
  errors: {},
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={htmlFor} style={{
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#6b7280",
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", color: "#e53e3e", margin: 0 }}>
          <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor">
            <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 9a.75.75 0 110-1.5A.75.75 0 016 9zm.75-3.75a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0v2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "10px",
  border: "1.5px solid #e5e7eb",
  background: "#f9fafb",
  padding: "11px 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: "40px",
};

export default function CreateAgreementForm() {
  const [state, action, pending] = useActionState(createAgreement, initialState);
  const errors = state?.errors ?? {};

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* Title */}
      <Field label="Agreement Title" htmlFor="title" error={errors.title}>
        <input style={inputStyle} id="title" name="title" type="text" placeholder="e.g. Service Agreement with Juan" />
      </Field>

      {/* Type + Amount side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Agreement Type" htmlFor="agreementType" error={errors.agreementType}>
          <select style={selectStyle} id="agreementType" name="agreementType">
            <option value="LOAN">Loan</option>
            <option value="SALE">Sale</option>
            <option value="SWAP">Swap</option>
            <option value="SERVICE">Service</option>
          </select>
        </Field>

        <Field label="Amount (PHP)" htmlFor="amount" error={errors.amount}>
          <input style={inputStyle} id="amount" name="amount" type="number" placeholder="0.00" />
        </Field>
      </div>

      {/* Subject Matter */}
      <Field label="Subject Matter" htmlFor="subjectMatter" error={errors.subjectMatter}>
        <input style={inputStyle} id="subjectMatter" name="subjectMatter" type="text" placeholder="What is this agreement about?" />
      </Field>

      {/* Payment Terms */}
      <Field label="Payment Terms" htmlFor="paymentTerms" error={errors.paymentTerms}>
        <input style={inputStyle} id="paymentTerms" name="paymentTerms" placeholder="e.g. 50% upfront, 50% on completion" />
      </Field>

      {/* Terms & Conditions */}
      <Field label="Terms & Conditions" htmlFor="termsText" error={errors.termsText}>
        <textarea
          style={{ ...inputStyle, minHeight: "120px", resize: "vertical", lineHeight: 1.6 }}
          id="termsText"
          name="termsText"
          placeholder="Describe the full terms of this agreement..."
        />
      </Field>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
        <span style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af" }}>Counterparty Details</span>
        <span style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      </div>

      {/* Counterparty Email */}
      <Field label="Counterparty Email" htmlFor="counterPartyEmail" error={errors.counterPartyEmail}>
        <input style={inputStyle} id="counterPartyEmail" name="counterPartyEmail" type="email" placeholder="counterparty@example.com" />
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: "6px",
          width: "100%",
          padding: "13px",
          borderRadius: "10px",
          border: "none",
          background: pending ? "#249E94" : "linear-gradient(135deg, #005461, #0C7779)",
          color: "white",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {pending && (
          <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        {pending ? "Creating…" : "Create Agreement"}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}