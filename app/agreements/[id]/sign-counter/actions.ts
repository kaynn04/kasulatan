"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

// The type lives here but NOT exported, because it's only relevant to this file.
// We'll define it in the form file too, but that's just for the FE dev to know what errors they can expect.
type SignAgreementState = {
    success: boolean;
    errors: {
        confirmedRead?: string;
        consentedSignature?: string;
        typedSignature?: string;
        signatureImage?: string;
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
    const signatureImage = (formData.get("signatureImage") as string)?.trim();

    const session = await getSession();

    if (!session) {
        return {
            success: false,
            errors: { general: "You must be logged in to sign an agreement." },
        };
    }

    // --- STEP 2: Validate user is the counterparty ---
    const counterParty = await prisma.agreementParty.findFirst({
        where: {
            agreementId: agreementId,
            role: "COUNTERPARTY",
        },
    });

    // Note: We compare emails in lowercase to avoid case sensitivity issues, as emails are generally case-insensitive.
    if (!counterParty || counterParty.email.toLowerCase() !== session.email.toLowerCase()) {
        return {
            success: false,
            errors: { general: "You are not authorized to sign this agreement." },
        };
    }

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

    // --- STEP 3: Validate form inputs ---
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
    if (signatureImage && !signatureImage.startsWith("data:image/")) {
        errors.signatureImage = "Please provide a valid signature image.";
    }
    if (signatureImage && signatureImage.length > 700_000) {
        errors.signatureImage = "Signature image is too large. Please upload a smaller image.";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    
    // Extra check to ensure counterParty exists before accessing fullName, even though we checked earlier. This is just to satisfy TypeScript's type checking.
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
            signatureImage: signatureImage || null,
            consentedToElectronicSignature: true,
            confirmedReadAgreement: true,
            signedAt: new Date(),
        },
    });

    // --- STEP 6: Create an audit log entry ---
    await prisma.auditLog.create({
        data: {
            agreementId: agreementId,
            actorUserId: session.id,
            actorEmail: session.email,
            action: "agreement_signed_by_counterparty",
        }
    });

    // --- STEP 7: Update agreement status
    await prisma.agreement.update({
        where: { id: agreementId },
        data: {
            status: "SIGNED_BY_COUNTERPARTY",
        },
    });

    // --- STEP 8: Redirect back to agreement details page ---
    redirect(`/agreements/${agreementId}`);
}
