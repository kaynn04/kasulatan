"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// The type lives here but NOT exported, because it's only relevant to this file.
// We'll define it in the form file too, but that's just for the FE dev to know what errors they can expect.
type SignAgreementState = {
    success: boolean;
    errors: {
        confirmedRead?: string;
        consentedSignature?: string;
        typedSignature?: string;
        general?: string; // for any other errors that don't fit the above categories
    };
};

export async function signAgreement(
    prevState: SignAgreementState,
    formData: FormData
): Promise<SignAgreementState> {
    // --- STEP 1: Extract form values ---
    const agreementId = formData.get("agreementId") as string;
    const confirmedRead = formData.get("confirmedRead") === "on"; // checkbox returns "on" if checked
    const consentedSignature = formData.get("consentedSignature") === "on";
    const typedSignature = (formData.get("typedSignature") as string)?.trim();

    // check if agreement is in a signable state
    const agreement = await prisma.agreement.findUnique({
        where: { id: agreementId },
    });

    if (!agreement || agreement.status !== "DRAFT") {
        return {
            success: false,
            errors: { general: "This agreement cannot be signed." },
        };
    }

    // --- STEP 2: Validate form input ---
    const errors: SignAgreementState["errors"] = {};

    if (!confirmedRead) {
        errors.confirmedRead = "You must confirm you have read the agreement.";
    }
    if (!consentedSignature) {
        errors.consentedSignature = "You must consent to electronic signature.";
    }
    if (!typedSignature) {
        errors.typedSignature = "Please type your full name as your signature.";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    // --- STEP 3: Find the counterparty record ---
    const counterParty = await prisma.agreementParty.findFirst({
        where: {
            agreementId: agreementId,
            role: "COUNTERPARTY",
        },
    });

    if (!counterParty) {
        return {
            success: false,
            errors: { general: "Counterparty record not found" },
        };
    }

    // --- STEP 4: Validate signature matches their name ---
    // Compare lowercase so "john doe" matches "John Doe"
    if (typedSignature.toLowerCase() !== counterParty.fullName.toLowerCase()) {
        return {
            success: false,
            errors: { typedSignature: "Signature must match your full name: " + counterParty.fullName},
        };
    }

    // --- STEP 5: Update the AgreementParty record ---
    await prisma.agreementParty.update({
        where: { id: counterParty.id },
        data: {
            typedSignature: typedSignature,
            consentedToElectronicSignature: true,
            confirmedReadAgreement: true,
            signedAt: new Date(),
        },
    });

    // --- STEP 6: Update agreement status ---
    await prisma.agreement.update({
        where: { id: agreementId },
        data: {
            status: "SIGNED_BY_COUNTERPARTY",
        },
    });

    // --- STEP 7: Redirect to agreement details page ---
    redirect(`/agreements/${agreementId}`);
}