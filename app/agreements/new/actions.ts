"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/auth-rate-limit";
import {
    formString,
    isValidDateOnly,
    isValidEmail,
    isValidMoneyAmount,
    normalizeEmail,
} from "@/lib/form-validation";

type CreateAgreementState = {
    success: boolean;
    errors: {
        title?: string;
        agreementType?: string;
        subjectMatter?: string;
        amount?: string;
        dueDate?: string;
        paymentTerms?: string;
        termsText?: string;
        counterPartyEmail?: string;
    };
};

function formatAddress(user: {
    addressLine?: string | null;
    barangay?: string | null;
    cityMunicipality?: string | null;
    province?: string | null;
    postalCode?: string | null;
}) {
    return [
        user.addressLine,
        user.barangay,
        user.cityMunicipality,
        user.province,
        user.postalCode,
    ]
        .filter(Boolean)
        .join(", ");
}

export async function createAgreement(
    prevState: CreateAgreementState,
    formData: FormData
): Promise<CreateAgreementState> {
    const title = formString(formData, "title");
    const agreementType = formString(formData, "agreementType");
    const subjectMatter = formString(formData, "subjectMatter");
    const amountRaw = formString(formData, "amount");
    const dueDateRaw = formString(formData, "dueDate");
    const paymentTerms = formString(formData, "paymentTerms");
    const termsText = formString(formData, "termsText");
    const counterPartyEmail = normalizeEmail(formString(formData, "counterPartyEmail"));

    const session = await getSession();

    if (!session) {
        return {
            success: false,
            errors: {
                title: "Unauthorized. Please log in.",
            },
        };
    }

    const errors: CreateAgreementState["errors"] = {};

    if (!title) errors.title = "Title is required";
    else if (title.length > 160) errors.title = "Title must be 160 characters or fewer";
    if (!subjectMatter) errors.subjectMatter = "Subject matter is required";
    else if (subjectMatter.length > 5_000) errors.subjectMatter = "Subject matter must be 5,000 characters or fewer";
    if (!paymentTerms) errors.paymentTerms = "Payment terms are required";
    else if (paymentTerms.length > 5_000) errors.paymentTerms = "Payment terms must be 5,000 characters or fewer";
    if (!termsText) errors.termsText = "Terms are required";
    else if (termsText.length > 30_000) errors.termsText = "Terms must be 30,000 characters or fewer";

    if (!isValidMoneyAmount(amountRaw)) {
        errors.amount = "Enter a positive amount up to 999,999,999.99 with at most 2 decimal places";
    }

    const dueDate = dueDateRaw ? new Date(`${dueDateRaw}T00:00:00.000Z`) : null;
    if (dueDateRaw && !isValidDateOnly(dueDateRaw)) {
        errors.dueDate = "Enter a valid due date";
    }

    if (!counterPartyEmail) {
        errors.counterPartyEmail = "Counterparty email is required";
    } else if (!isValidEmail(counterPartyEmail)) {
        errors.counterPartyEmail = "Invalid email address";
    } else if (counterPartyEmail === session.email.toLowerCase()) {
        errors.counterPartyEmail = "You cannot create an agreement with yourself";
    }

    if (!["LOAN", "SALE", "SWAP", "SERVICE"].includes(agreementType)) {
        errors.agreementType = "Invalid agreement type";
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            errors,
        };
    }

    const counterPartyUser = await prisma.user.findUnique({
        where: { email: counterPartyEmail },
    });

    if (!counterPartyUser) {
        return {
            success: false,
            errors: {
                counterPartyEmail: "User with this email not found. They must register first.",
            },
        };
    }

    const headerStore = await headers();
    const ipAddress = await getClientIp();
    const userAgent = headerStore.get("user-agent")?.slice(0, 500) ?? null;

    await prisma.$transaction(async (tx) => {
        const agreement = await tx.agreement.create({
            data: {
                referenceNumber: `KAS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(4).toString("hex").toUpperCase()}`,
                createdById: session.id,
                agreementType: agreementType as "LOAN" | "SALE" | "SWAP" | "SERVICE",
                title,
                subjectMatter,
                amount: amountRaw,
                currency: "PHP",
                paymentTerms,
                dueDate,
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
                    address: formatAddress(session) || null,
                    userId: session.id,
                },
                {
                    agreementId: agreement.id,
                    role: "COUNTERPARTY",
                    fullName: counterPartyUser.name || "Unknown User",
                    email: counterPartyEmail,
                    mobileNumber: counterPartyUser.mobileNumber || null,
                    address: formatAddress(counterPartyUser) || null,
                    userId: counterPartyUser.id,
                },
            ],
        });

        await tx.auditLog.create({
            data: {
                agreementId: agreement.id,
                actorUserId: session.id,
                actorEmail: session.email,
                action: "agreement_created",
                ipAddress,
                userAgent,
            },
        });
    });

    redirect("/agreements");
}
