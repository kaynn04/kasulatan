"use client";

import { useActionState } from "react";
import { loginUser } from "./actions";

type LoginState = {
    success: boolean;
    errors: {
        email?: string;
        password?: string;
        general?: string; // for any other errors that don't fit the above categories
    };
};

const initialState: LoginState = {
    success: false,
    errors: {},
};

export default function LoginForm() {
    const [state, action, pending] = useActionState(loginUser, initialState);

    return (
        <form action={action}>
            {/* General errors (not tied to a field) */}
            {state?.errors?.general && <p style={{ color: "red" }}>{state.errors.general}</p>}
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
                {state?.errors?.email && <p style={{ color: "red" }}>{state.errors.email}</p>}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
                {state?.errors?.password && <p style={{ color: "red" }}>{state.errors.password}</p>}
            </div>
            <button type="submit" disabled={pending}>Login</button>
        </form>
    )
}