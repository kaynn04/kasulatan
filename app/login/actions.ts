"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { consumeRateLimit, getClientIp } from "@/lib/auth-rate-limit";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const INVALID_CREDENTIALS = "Invalid email or password.";
const TOO_MANY_ATTEMPTS = "Too many sign-in attempts. Please try again later.";
const DUMMY_PASSWORD_HASH = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

type LoginState = {
    success: boolean;
    errors: {
        email?: string;
        password?: string;
        general?: string; // for any other errors that don't fit the above categories
    };
};

export async function loginUser(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    // --- STEP 1: Extract form values ---
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    // -- STEP 2: Validate form input ---
    const errors: LoginState["errors"] = {};

    if (!email) {
        errors.email = "Email is required.";
    }
    if (!password) {
        errors.password = "Password is required.";
    }
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const ipAddress = await getClientIp();
    const emailAllowed = await consumeRateLimit({
        scope: "login-email",
        identifier: email,
        limit: 10,
        windowSeconds: 15 * 60,
    });
    const ipAllowed = !ipAddress || await consumeRateLimit({
        scope: "login-ip",
        identifier: ipAddress,
        limit: 50,
        windowSeconds: 15 * 60,
    });

    if (!emailAllowed || !ipAllowed) {
        return {
            success: false,
            errors: { general: TOO_MANY_ATTEMPTS },
        };
    }

    // --- STEP 3: Check if user exists ---
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // --- STEP 4: Verify password ---
    const passwordMatch = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !passwordMatch) {
        return {
            success: false,
            errors: { general: INVALID_CREDENTIALS },
        };
    }

    // --- STEP 5: Set session cookie and redirect ---
    await createSession(user.id);
    redirect("/dashboard");
}   

