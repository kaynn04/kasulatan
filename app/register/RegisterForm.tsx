"use client";

import { useActionState } from "react";
import { registerUser } from "./actions";

type RegisterState = {
    success: boolean;
    errors: {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        general?: string; // for any other errors that don't fit the above categories
    };
};

const initialState: RegisterState = {
    success: false,
    errors: {},
};

export default function RegisterForm() {
    const [state, action, pending] = useActionState(registerUser, initialState);

    return (
        <form action={action}>
            {/* General errors (not tied to a field) */}
            {state?.errors?.general && <p style={{ color: "red" }}>{state.errors.general}</p>}
            <div>
                <label htmlFor="name">Name</label>
                <input type="text" name="name" id="name" />
                {state?.errors?.name && <p style={{ color: "red" }}>{state.errors.name}</p>}
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" />
                {state?.errors?.email && <p style={{ color: "red" }}>{state.errors.email}</p>}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" />
                {state?.errors?.password && <p style={{ color: "red" }}>{state.errors.password}</p>}
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" />
                {state?.errors?.confirmPassword && <p style={{ color: "red" }}>{state.errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={pending}>
                {pending ? "Registering..." : "Register"}
            </button>
        </form>
    );
}