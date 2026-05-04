"use server";
// ^ This marks the ENTIRE file as server-only code.
// Nothing in this file will ever run in the browser.
// This replaces the "use server" that was inside your function before.

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// --- THE STATE OBJECT TYPE ---
// This is the "contract" between BE and FE.
// The FE dev looks at this to know what errors they need to display.
// The BE dev looks at this to know what errors they can return.
type CreateAgreementState = {
    success: boolean;
    errors: {
        title?: string;          // "?" means this field is optional
        agreementType?: string;  // not every field will have an error every time
        subjectMatter?: string;
        amount?: string;
        paymentTerms?: string;
        termsText?: string;
        counterPartyEmail?: string;
    };
};


// THE SERVER ACTION
// Notice it now takes TWO parameters:
//   prevState — useActionState passes the previous state automatically
//   formData  — the form data (same as before)
export async function createAgreement(
    prevState: CreateAgreementState,
    formData: FormData
): Promise<CreateAgreementState> {

    // --- STEP 1: Extract and clean form values ---
    // .trim() removes whitespace so "   " counts as empty
    const title = (formData.get("title") as string)?.trim();
    const agreementType = formData.get("agreementType") as string;
    const subjectMatter = (formData.get("subjectMatter") as string)?.trim();
    const amountRaw = formData.get("amount") as string;
    const paymentTerms = (formData.get("paymentTerms") as string)?.trim();
    const termsText = (formData.get("termsText") as string)?.trim();
    const counterPartyName = (formData.get("counterPartyName") as string)?.trim();
    const counterPartyMobile = (formData.get("counterPartyMobile") as string)?.trim();
    const counterPartyEmail = (formData.get("counterPartyEmail") as string)?.trim();

    const session = await getSession();

    if (!session) {
        return {
            success: false,
            errors: {
                title: "Unauthorized. Please log in.",
            }
        };
    };

    // --- STEP 2: Validate ---
    // We collect ALL errors first, then check at the end.
    // This way the user sees every problem at once, not one at a time.
    const errors: CreateAgreementState["errors"] = {};

    if (!title) errors.title = "Title is required";
    if (!subjectMatter) errors.subjectMatter = "Subject matter is required";
    if (!paymentTerms) errors.paymentTerms = "Payment terms are required";
    if (!termsText) errors.termsText = "Terms are required";

    // Amount needs special validation — must be a real positive number
    const amount = parseFloat(amountRaw);
    if (!amountRaw || isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be a positive number";
    }

    // Email: must exist AND have basic format
    if (!counterPartyEmail) {
        errors.counterPartyEmail = "Counterparty email is required";
    } else if (!counterPartyEmail.includes("@")) {
        errors.counterPartyEmail = "Invalid email address";
    }

    // Agreement type must be one of our allowed values
    if (!["LOAN", "SALE", "SWAP", "SERVICE"].includes(agreementType)) {
        errors.agreementType = "Invalid agreement type";
    }

    // --- STEP 3: If ANY errors exist, STOP HERE ---
    // Return the state object with errors. Do NOT touch the database.
    // The form will re-render and show these error messages.
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            errors,
        };
    }

    // --- STEP 3B: Look up counterparty user by email ---
    const counterPartyUser = await prisma.user.findUnique({
        where: { email: counterPartyEmail },
    });

    if (!counterPartyUser) {
        return {
            success: false,
            errors: {
                counterPartyEmail: "User with this email not found. They must register first.",
            }
        };
    }

    // --- STEP 4: Validation passed — write to DB (same as before) ---
    await prisma.$transaction(async (tx) => {
        const agreement = await tx.agreement.create({
            data: {
                referenceNumber: `KAS-${Date.now()}`,
                createdById: session.id,
                agreementType: agreementType as "LOAN" | "SALE" | "SWAP" | "SERVICE",
                title,
                subjectMatter,
                amount,
                currency: "PHP",
                paymentTerms,
                dueDate: null,
                termsText,
                serviceFee: 99,
            },
        });

        await tx.agreementParty.createMany({
            data: [
                {
                    agreementId: agreement.id,
                    role: "CREATOR",
                    fullName: session.name || "Unknown User",
                    email: session.email || "unknown@example.com",
                    mobileNumber: session.mobileNumber || null,
                },
                {
                    agreementId: agreement.id,
                    role: "COUNTERPARTY",
                    fullName: counterPartyUser.name || "Unknown User",
                    email: counterPartyEmail,
                    mobileNumber: counterPartyUser.mobileNumber || null,
                },
            ],
        });

        await tx.auditLog.create({
            data: {
                agreementId: agreement.id,
                actorUserId: session.id,
                actorEmail: session.email,
                action: "agreement_created",
            },
        });
    });

    // --- STEP 5: Success → redirect (same as before) ---
    redirect("/agreements");
}