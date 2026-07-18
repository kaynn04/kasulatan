"use client";

import { useActionState } from "react";
import { loginUser } from "./actions";
import styles from "../auth.module.css";

type LoginState = {
  success: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
};

const initialState: LoginState = {
  success: false,
  errors: {},
};

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4.5a1 1 0 0 1-2 0v-3a1 1 0 0 1 2 0v3Z" />
    </svg>
  );
}

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
    <div className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className={styles.fieldError}><ErrorIcon />{error}</p>}
    </div>
  );
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, initialState);

  return (
    <form action={action} className={styles.loginForm}>
      {state?.errors?.general && (
        <div className={styles.errorBanner} role="alert">
          <ErrorIcon />
          <p>{state.errors.general}</p>
        </div>
      )}

      <Field label="Email address" htmlFor="email" error={state?.errors?.email}>
        <input
          className={styles.input}
          type="email"
          id="email"
          name="email"
          placeholder="maria@example.com"
          autoComplete="email"
          aria-invalid={Boolean(state?.errors?.email)}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={state?.errors?.password}>
        <input
          className={styles.input}
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(state?.errors?.password)}
        />
      </Field>

      <button type="submit" disabled={pending} className={styles.submitButton}>
        {pending && <span className={styles.spinner} aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in securely"}
        {!pending && (
          <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        )}
      </button>

      <p className={styles.formFootnote}>
        Your session is stored in a secure, HTTP-only cookie on this device.
      </p>
    </form>
  );
}
