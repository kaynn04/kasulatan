"use client";

import { useActionState } from "react";
import { registerUser } from "./actions";

type RegisterState = {
  success: boolean;
  errors: {
    name?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    addressLine?: string;
    barangay?: string;
    cityMunicipality?: string;
    province?: string;
    postalCode?: string;
    general?: string;
  };
};

const initialState: RegisterState = {
  success: false,
  errors: {},
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
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#334155",
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{
          display: "flex", alignItems: "center", gap: "5px",
          fontSize: "12px", color: "#dc2626", margin: 0,
        }}>
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

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);
  const errors = state?.errors ?? {};

  return (
    <form action={action} style={{ display: "grid", gap: "28px" }}>
      {errors.general && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          borderRadius: "10px", border: "1px solid rgba(220,38,38,0.2)",
          background: "rgba(220,38,38,0.05)", padding: "12px 14px",
        }}>
          <svg viewBox="0 0 16 16" width="15" height="15" fill="#dc2626" style={{ marginTop: "1px", flexShrink: 0 }} aria-hidden="true">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 12a1 1 0 110-2 1 1 0 010 2zm1-4.5a1 1 0 01-2 0v-3a1 1 0 012 0v3z" />
          </svg>
          <p style={{ fontSize: "13px", color: "#dc2626", margin: 0 }}>{errors.general}</p>
        </div>
      )}

      <Section
        title="Personal identity"
        description="Use the name and contact number you want to appear in agreements you create or sign."
      >
        <Field label="Full legal name" htmlFor="name" error={errors.name}>
          <input style={inputStyle} type="text" name="name" id="name" placeholder="Maria Santos" autoComplete="name" />
        </Field>

        <Field label="Mobile number" htmlFor="mobileNumber" error={errors.mobileNumber} hint="This helps identify and contact the correct party.">
          <input style={inputStyle} type="tel" name="mobileNumber" id="mobileNumber" placeholder="09XX XXX XXXX" autoComplete="tel" />
        </Field>
      </Section>

      <Section
        title="Registered address"
        description="This location can be reused in agreement party details so creators do not need to type it again."
      >
        <Field label="House no., street, building, or landmark" htmlFor="addressLine" error={errors.addressLine}>
          <input style={inputStyle} type="text" name="addressLine" id="addressLine" placeholder="Unit 2, 123 Mabini Street" autoComplete="address-line1" />
        </Field>

        <div className="register-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Barangay" htmlFor="barangay" error={errors.barangay}>
            <input style={inputStyle} type="text" name="barangay" id="barangay" placeholder="Barangay San Antonio" autoComplete="address-line2" />
          </Field>

          <Field label="City / Municipality" htmlFor="cityMunicipality" error={errors.cityMunicipality}>
            <input style={inputStyle} type="text" name="cityMunicipality" id="cityMunicipality" placeholder="Quezon City" autoComplete="address-level2" />
          </Field>
        </div>

        <div className="register-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Province" htmlFor="province" error={errors.province}>
            <input style={inputStyle} type="text" name="province" id="province" placeholder="Metro Manila" autoComplete="address-level1" />
          </Field>

          <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode}>
            <input style={inputStyle} type="text" name="postalCode" id="postalCode" placeholder="1100" autoComplete="postal-code" />
          </Field>
        </div>
      </Section>

      <Section
        title="Account security"
        description="Keep email and password together because these are the credentials used to access your account."
      >
        <Field label="Email address" htmlFor="email" error={errors.email}>
          <input style={inputStyle} type="email" name="email" id="email" placeholder="maria@example.com" autoComplete="email" />
        </Field>

        <div className="register-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <input style={inputStyle} type="password" name="password" id="password" placeholder="At least 8 characters" autoComplete="new-password" />
          </Field>

          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <input style={inputStyle} type="password" name="confirmPassword" id="confirmPassword" placeholder="Re-enter password" autoComplete="new-password" />
          </Field>
        </div>
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
          Your profile details will be copied into agreement records when needed.
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
          }}
        >
          {pending ? "Creating..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
