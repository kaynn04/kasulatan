"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/auth-rate-limit";
import { formString, isValidSignatureImage } from "@/lib/form-validation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
    _prevState: SignAgreementState,
    formData: FormData
): Promise<SignAgreementState> {
    const agreementId = formString(formData, "agreementId");
    const confirmedRead = formData.get("confirmedRead") === "on";
    const consentedSignature = formData.get("consentedSignature") === "on";
    const typedSignature = formString(formData, "typedSignature");
    const signatureImage = formString(formData, "signatureImage");

    const session = await getSession();
    if (!session) {
        return { success: false, errors: { general: "You must be logged in to sign an agreement." } };
    }

    if (!agreementId || agreementId.length > 64) {
        return { success: false, errors: { general: "Invalid agreement." } };
    }

    const creator = await prisma.agreementParty.findFirst({
        where: {
            agreementId,
            role: "CREATOR",
            userId: session.id,
            agreement: { createdById: session.id },
        },
        select: { id: true, fullName: true },
    });

    if (!creator) {
        return { success: false, errors: { general: "You are not authorized to sign this agreement." } };
    }

    const errors: SignAgreementState["errors"] = {};
    if (!confirmedRead) errors.confirmedRead = "You must confirm you have read the agreement.";
    if (!consentedSignature) errors.consentedSignature = "You must consent to electronic signature.";
    if (!typedSignature) {
        errors.typedSignature = "Please type your full name as your signature.";
    } else if (typedSignature.length > 120) {
        errors.typedSignature = "Signature must be 120 characters or fewer.";
    } else if (typedSignature.localeCompare(creator.fullName, undefined, { sensitivity: "accent" }) !== 0) {
        errors.typedSignature = `Signature must match your full name: ${creator.fullName}`;
    }
    if (!isValidSignatureImage(signatureImage)) {
        errors.signatureImage = "Use a PNG, JPG, or WebP signature image smaller than 700 KB.";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const headerStore = await headers();
    const ipAddress = await getClientIp();
    const userAgent = headerStore.get("user-agent")?.slice(0, 500) ?? null;
    const signed = await prisma.$transaction(async (tx) => {
        const claimed = await tx.agreement.updateMany({
            where: {
                id: agreementId,
                createdById: session.id,
                status: "SIGNED_BY_COUNTERPARTY",
            },
            data: { status: "FINALIZED" },
        });

        if (claimed.count !== 1) return false;

        await tx.agreementParty.update({
            where: { id: creator.id },
            data: {
                typedSignature,
                signatureImage: signatureImage || null,
                consentedToElectronicSignature: true,
                confirmedReadAgreement: true,
                signedAt: new Date(),
                ipAddress,
                userAgent,
            },
        });
        await tx.auditLog.create({
            data: {
                agreementId,
                actorUserId: session.id,
                actorEmail: session.email,
                action: "agreement_signed_by_creator",
                ipAddress,
                userAgent,
            },
        });
        return true;
    });

    if (!signed) {
        return { success: false, errors: { general: "This agreement cannot be signed or was already finalized." } };
    }

    redirect(`/agreements/${agreementId}`);
}
