"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// The type lives here but NOT exported, because it's only relevant to this file.
type RegisterState = {
    success: boolean;
    errors: {
        name?: string;
        email?: string;
        password?: string;
        mobileNumber?: string;
        confirmPassword?: string;
        general?: string; // for any other errors that don't fit the above categories
    };
};

export async function registerUser(
    prevState: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    // --- STEP 1: Extract form values ---
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const mobileNumber = (formData.get("mobileNumber") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // --- STEP 2: Validate form input ---
    const errors: RegisterState["errors"] = {};

    if (!name) {
        errors.name = "Name is required.";
    }
    if (!email) {
        errors.email = "Email is required.";
    }
    if (!mobileNumber) {
        errors.mobileNumber = "Mobile number is required.";
    }
    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
    }
    if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // --- STEP 3: Check if user already exists ---
    const userExists = await prisma.user.findUnique({
        where: { email },
    });

    if (userExists) {
        return {
            success: false,
            errors: { 
                email: "An account with this email already exists."
            }
        }
    }

    // --- STEP 4: Create the user ---
    await prisma.user.create({
        data: {
            name,
            email,
            mobileNumber,
            passwordHash,
            
        }
    });

    // redirect to login page after successful registration
    redirect("/login");
}
