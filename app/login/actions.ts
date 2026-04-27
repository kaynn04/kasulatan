"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


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
    const email = (formData.get("email") as string)?.trim();
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

    // --- STEP 3: Check if user exists ---
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return {
            success: false,
            errors: {
                email: "Invalid email or password."
            }
        }
    }

    // --- STEP 4: Verify password ---
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return {
            success: false,
            errors: {
                password: "Invalid email or password."
            }
        }
    }

    // --- STEP 5: Set session cookie and redirect ---
    // Here you would typically set a session cookie or JWT token to keep the user logged in.
    // For this example, we'll just redirect to the dashboard.
    const cookieStore = await cookies();
    cookieStore.set("sessionId", user.id, {httpOnly: true });
    redirect("/dashboard");
}   

