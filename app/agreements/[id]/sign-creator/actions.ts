"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

type SignAgreementState = {
    success: boolean;
    errors: {
        confirmedRead?: string;
        consentedSignature?: string;
        typedSignature?: string;
        signatureImage?: string;
        general?: string;
    };
};

export async function signAgreementAsCreator(
    prevState: SignAgreementState,
    formData: FormData
): Promise<SignAgreementState>{
    const agreementId = formData.get("agreementId") as string;
    const confirmedRead = formData.get("confirmedRead") === "on"; // checkbox returns "on" if checked
    const consentedSignature = formData.get("consentedSignature") === "on";
    const typedSignature = (formData.get("typedSignature") as string)?.trim();
    const signatureImage = (formData.get("signatureImage") as string)?.trim();

    // check if agreement is in a signable state
        const agreement = await prisma.agreement.findUnique({
            where: { id: agreementId },
        });
    
        if (!agreement || agreement.status !== "SIGNED_BY_COUNTERPARTY") {
            return {
                success: false,
                errors: { general: "This agreement cannot be signed." },
            };
        }

        // --- STEP 1: Validate user is logged in and is the creator ---
        const session = await getSession();

        if (!session) {
            return {
                success: false,
                errors: { general: "You must be logged in to sign an agreement." },
            };
        }

        if (agreement.createdById !== session.id) {
            return {
                success: false,
                errors: { general: "You are not authorized to sign this agreement." },
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
        if (signatureImage && !signatureImage.startsWith("data:image/")) {
            errors.signatureImage = "Please provide a valid signature image.";
        }
        if (signatureImage && signatureImage.length > 700_000) {
            errors.signatureImage = "Signature image is too large. Please upload a smaller image.";
        }
    
        if (Object.keys(errors).length > 0) {
            return { success: false, errors };
        }
    
        // --- STEP 3: Find the counterparty record ---
        const creator = await prisma.agreementParty.findFirst({
            where: {
                agreementId: agreementId,
                role: "CREATOR",
            },
        });
    
        if (!creator) {
            return {
                success: false,
                errors: { general: "Creator record not found" },
            };
        }
    
        // --- STEP 4: Validate signature matches their name ---
        // Compare lowercase so "john doe" matches "John Doe"
        if (typedSignature.toLowerCase() !== creator.fullName.toLowerCase()) {
            return {
                success: false,
                errors: { typedSignature: "Signature must match your full name: " + creator.fullName},
            };
        }
    
        // --- STEP 5: Update the AgreementParty record ---
        await prisma.agreementParty.update({
            where: { id: creator.id },
            data: {
                typedSignature: typedSignature,
                signatureImage: signatureImage || null,
                consentedToElectronicSignature: true,
                confirmedReadAgreement: true,
                signedAt: new Date(),
            },
        });

        // --- STEP 6: Create audit log entry ---
        await prisma.auditLog.create({
            data: {
                agreementId: agreementId,
                actorUserId: session.id,
                actorEmail: session.email,
                action: "agreement_signed_by_creator",
            },
        });
    
        // --- STEP 7: Update agreement status to FINALIZED ---
        await prisma.agreement.update({
            where: { id: agreementId },
            data: {
                status: "FINALIZED",
            },
        });
    
        // --- STEP 8: Redirect back to agreement details page ---
        redirect(`/agreements/${agreementId}`);
}
