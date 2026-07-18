"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { consumeRateLimit, getClientIp } from "@/lib/auth-rate-limit";
import { prisma } from "@/lib/prisma";
import { formString, isValidEmail, normalizeEmail } from "@/lib/form-validation";

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
    const name = formString(formData, "name");
    const email = normalizeEmail(formString(formData, "email"));
    const mobileNumber = formString(formData, "mobileNumber");
    const addressLine = formString(formData, "addressLine");
    const barangay = formString(formData, "barangay");
    const cityMunicipality = formString(formData, "cityMunicipality");
    const province = formString(formData, "province");
    const postalCode = formString(formData, "postalCode");
    const passwordValue = formData.get("password");
    const confirmPasswordValue = formData.get("confirmPassword");
    const password = typeof passwordValue === "string" ? passwordValue : "";
    const confirmPassword = typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

    const errors: RegisterState["errors"] = {};
    const ipAddress = await getClientIp();

    if (ipAddress) {
        const registrationAllowed = await consumeRateLimit({
            scope: "register-ip",
            identifier: ipAddress,
            limit: 5,
            windowSeconds: 60 * 60,
        });

        if (!registrationAllowed) {
            return {
                success: false,
                errors: { general: "Too many registration attempts. Please try again later." },
            };
        }
    }

    if (email) {
        const emailAllowed = await consumeRateLimit({
            scope: "register-email",
            identifier: email,
            limit: 3,
            windowSeconds: 60 * 60,
        });

        if (!emailAllowed) {
            return {
                success: false,
                errors: { general: "Too many registration attempts. Please try again later." },
            };
        }
    }

    if (!name) errors.name = "Full legal name is required.";
    else if (name.length > 120) errors.name = "Full legal name must be 120 characters or fewer.";
    if (!email) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
        errors.email = "Enter a valid email address.";
    }
    if (!mobileNumber) errors.mobileNumber = "Mobile number is required.";
    else if (mobileNumber.length > 30) errors.mobileNumber = "Mobile number must be 30 characters or fewer.";
    if (!addressLine) errors.addressLine = "House number, street, or landmark is required.";
    else if (addressLine.length > 200) errors.addressLine = "Address must be 200 characters or fewer.";
    if (!barangay) errors.barangay = "Barangay is required.";
    else if (barangay.length > 100) errors.barangay = "Barangay must be 100 characters or fewer.";
    if (!cityMunicipality) errors.cityMunicipality = "City or municipality is required.";
    else if (cityMunicipality.length > 100) errors.cityMunicipality = "City or municipality must be 100 characters or fewer.";
    if (!province) errors.province = "Province is required.";
    else if (province.length > 100) errors.province = "Province must be 100 characters or fewer.";
    if (!postalCode) errors.postalCode = "Postal code is required.";
    else if (postalCode.length > 12) errors.postalCode = "Postal code must be 12 characters or fewer.";

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 12) {
        errors.password = "Password must be at least 12 characters long.";
    } else if (Buffer.byteLength(password, "utf8") > 72) {
        errors.password = "Password must be 72 bytes or fewer.";
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
                general: "Unable to create an account with these details. If you already registered, sign in instead.",
            },
        };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
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
    } catch {
        return {
            success: false,
            errors: {
                general: "Unable to create an account with these details. If you already registered, sign in instead.",
            },
        };
    }

    redirect("/login");
}
