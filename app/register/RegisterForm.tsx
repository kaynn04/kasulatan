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
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#6b7280",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{
          display: "flex", alignItems: "center", gap: "4px",
          fontSize: "11.5px", color: "#e53e3e", margin: 0,
        }}>
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
  padding: "10px 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* General error */}
      {state?.errors?.general && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          borderRadius: "10px", border: "1px solid rgba(229,62,62,0.2)",
          background: "rgba(229,62,62,0.05)", padding: "12px 14px",
        }}>
          <svg viewBox="0 0 16 16" width="15" height="15" fill="#e53e3e" style={{ marginTop: "1px", flexShrink: 0 }}>
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 12a1 1 0 110-2 1 1 0 010 2zm1-4.5a1 1 0 01-2 0v-3a1 1 0 012 0v3z" />
          </svg>
          <p style={{ fontSize: "13px", color: "#e53e3e", margin: 0 }}>{state.errors.general}</p>
        </div>
      )}

      <Field label="Full name" htmlFor="name" error={state?.errors?.name}>
        <input style={inputStyle} type="text" name="name" id="name" placeholder="Jane Smith" />
      </Field>

      <Field label="Email address" htmlFor="email" error={state?.errors?.email}>
        <input style={inputStyle} type="email" name="email" id="email" placeholder="jane@example.com" />
      </Field>

      <Field label="Mobile number" htmlFor="mobileNumber" error={state?.errors?.mobileNumber}>
        <input style={inputStyle} type="text" name="mobileNumber" id="mobileNumber" placeholder="+63 912 345 6789" />
      </Field>

      <Field label="Password" htmlFor="password" error={state?.errors?.password}>
        <input style={inputStyle} type="password" name="password" id="password" placeholder="At least 8 characters" />
      </Field>

      <Field label="Confirm password" htmlFor="confirmPassword" error={state?.errors?.confirmPassword}>
        <input style={inputStyle} type="password" name="confirmPassword" id="confirmPassword" placeholder="Re-enter your password" />
      </Field>

      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: "6px",
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: pending ? "#249E94" : "linear-gradient(135deg, #005461, #0C7779)",
          color: "white",
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "inherit",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "opacity 0.2s",
        }}
      >
        {pending && (
          <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        {pending ? "Registering…" : "Create my account"}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}