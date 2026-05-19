"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type RegisterState = {
    success: boolean;
    errors: {
        name?: string;
        email?: string;
        password?: string;
        mobileNumber?: string;
        confirmPassword?: string;
        addressLine?: string;
        barangay?: string;
        cityMunicipality?: string;
        province?: string;
        postalCode?: string;
        general?: string;
    };
};

export async function registerUser(
    prevState: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const mobileNumber = (formData.get("mobileNumber") as string)?.trim();
    const addressLine = (formData.get("addressLine") as string)?.trim();
    const barangay = (formData.get("barangay") as string)?.trim();
    const cityMunicipality = (formData.get("cityMunicipality") as string)?.trim();
    const province = (formData.get("province") as string)?.trim();
    const postalCode = (formData.get("postalCode") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors: RegisterState["errors"] = {};

    if (!name) errors.name = "Full legal name is required.";
    if (!email) {
        errors.email = "Email is required.";
    } else if (!email.includes("@")) {
        errors.email = "Enter a valid email address.";
    }
    if (!mobileNumber) errors.mobileNumber = "Mobile number is required.";
    if (!addressLine) errors.addressLine = "House number, street, or landmark is required.";
    if (!barangay) errors.barangay = "Barangay is required.";
    if (!cityMunicipality) errors.cityMunicipality = "City or municipality is required.";
    if (!province) errors.province = "Province is required.";
    if (!postalCode) errors.postalCode = "Postal code is required.";

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const userExists = await prisma.user.findUnique({
        where: { email },
    });

    if (userExists) {
        return {
            success: false,
            errors: {
                email: "An account with this email already exists.",
            },
        };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            mobileNumber,
            addressLine,
            barangay,
            cityMunicipality,
            province,
            postalCode,
            passwordHash,
        },
    });

    redirect("/login");
}
