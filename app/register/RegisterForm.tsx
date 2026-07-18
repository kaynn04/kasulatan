"use client";

import { useActionState, useState } from "react";
import { registerUser } from "./actions";
import styles from "../auth.module.css";

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

type FieldName = Exclude<keyof RegisterState["errors"], "general">;
type FormValues = Record<FieldName, string>;

const initialValues: FormValues = {
  name: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  addressLine: "",
  barangay: "",
  cityMunicipality: "",
  province: "",
  postalCode: "",
};

function validateField(name: FieldName, values: FormValues) {
  const value = values[name].trim();

  if (!value) {
    const requiredMessages: Record<FieldName, string> = {
      name: "Full legal name is required.",
      email: "Email is required.",
      mobileNumber: "Mobile number is required.",
      password: "Password is required.",
      confirmPassword: "Please confirm your password.",
      addressLine: "House number, street, or landmark is required.",
      barangay: "Barangay is required.",
      cityMunicipality: "City or municipality is required.",
      province: "Province is required.",
      postalCode: "Postal code is required.",
    };

    return requiredMessages[name];
  }

  if (name === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
    return "Enter a valid email address.";
  }

  if (name === "password" && values.password.length < 12) {
    return "Password must be at least 12 characters long.";
  }

  if (name === "confirmPassword" && values.confirmPassword !== values.password) {
    return "Passwords do not match.";
  }

  return undefined;
}

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
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className={styles.fieldHint}>{hint}</p>}
      {error && <p className={styles.fieldError}><ErrorIcon />{error}</p>}
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber} aria-hidden="true">{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const errors = state?.errors ?? {};

  function inputProps(name: FieldName) {
    return {
      value: values[name],
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        setTouched((current) => ({ ...current, [name]: true }));
      },
      onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
      "aria-invalid": Boolean(errorFor(name)),
    };
  }

  function errorFor(name: FieldName) {
    if (touched[name]) return validateField(name, values);
    return errors[name];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const nextTouched = Object.fromEntries(
      Object.keys(initialValues).map((name) => [name, true])
    ) as Record<FieldName, boolean>;

    setTouched(nextTouched);

    if (Object.keys(initialValues).some((name) => validateField(name as FieldName, values))) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className={styles.registerForm}>
      {errors.general && (
        <div className={styles.errorBanner} role="alert">
          <ErrorIcon />
          <p>{errors.general}</p>
        </div>
      )}

      <Section
        number="1"
        title="Personal identity"
        description="Use the name and contact number you want to appear in agreements you create or sign."
      >
        <Field label="Full legal name" htmlFor="name" error={errorFor("name")}>
          <input {...inputProps("name")} className={styles.input} type="text" name="name" id="name" placeholder="Maria Santos" autoComplete="name" />
        </Field>

        <Field label="Mobile number" htmlFor="mobileNumber" error={errorFor("mobileNumber")} hint="This helps identify and contact the correct party.">
          <input {...inputProps("mobileNumber")} className={styles.input} type="tel" name="mobileNumber" id="mobileNumber" placeholder="09XX XXX XXXX" autoComplete="tel" />
        </Field>
      </Section>

      <Section
        number="2"
        title="Registered address"
        description="This location can be reused in agreement party details so you do not need to type it again."
      >
        <Field label="House no., street, building, or landmark" htmlFor="addressLine" error={errorFor("addressLine")}>
          <input {...inputProps("addressLine")} className={styles.input} type="text" name="addressLine" id="addressLine" placeholder="Unit 2, 123 Mabini Street" autoComplete="address-line1" />
        </Field>

        <div className={styles.twoColumn}>
          <Field label="Barangay" htmlFor="barangay" error={errorFor("barangay")}>
            <input {...inputProps("barangay")} className={styles.input} type="text" name="barangay" id="barangay" placeholder="Barangay San Antonio" autoComplete="address-line2" />
          </Field>

          <Field label="City / Municipality" htmlFor="cityMunicipality" error={errorFor("cityMunicipality")}>
            <input {...inputProps("cityMunicipality")} className={styles.input} type="text" name="cityMunicipality" id="cityMunicipality" placeholder="Quezon City" autoComplete="address-level2" />
          </Field>
        </div>

        <div className={styles.twoColumn}>
          <Field label="Province" htmlFor="province" error={errorFor("province")}>
            <input {...inputProps("province")} className={styles.input} type="text" name="province" id="province" placeholder="Metro Manila" autoComplete="address-level1" />
          </Field>

          <Field label="Postal code" htmlFor="postalCode" error={errorFor("postalCode")}>
            <input {...inputProps("postalCode")} className={styles.input} type="text" name="postalCode" id="postalCode" placeholder="1100" autoComplete="postal-code" inputMode="numeric" />
          </Field>
        </div>
      </Section>

      <Section
        number="3"
        title="Account security"
        description="Your email and password are the credentials used to access your agreement records."
      >
        <Field label="Email address" htmlFor="email" error={errorFor("email")}>
          <input {...inputProps("email")} className={styles.input} type="email" name="email" id="email" placeholder="maria@example.com" autoComplete="email" />
        </Field>

        <div className={styles.twoColumn}>
          <Field label="Password" htmlFor="password" error={errorFor("password")} hint="Use at least 12 characters.">
            <input {...inputProps("password")} className={styles.input} type="password" name="password" id="password" placeholder="At least 12 characters" autoComplete="new-password" />
          </Field>

          <Field label="Confirm password" htmlFor="confirmPassword" error={errorFor("confirmPassword")}>
            <input {...inputProps("confirmPassword")} className={styles.input} type="password" name="confirmPassword" id="confirmPassword" placeholder="Re-enter password" autoComplete="new-password" />
          </Field>
        </div>
      </Section>

      <div className={styles.formSubmitRow}>
        <p>Your profile details will be copied into agreement records when needed.</p>
        <button type="submit" disabled={pending} className={styles.submitButton}>
          {pending && <span className={styles.spinner} aria-hidden="true" />}
          {pending ? "Creating account…" : "Create account"}
          {!pending && (
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
