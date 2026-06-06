"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

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
    const title = (formData.get("title") as string)?.trim();
    const agreementType = formData.get("agreementType") as string;
    const subjectMatter = (formData.get("subjectMatter") as string)?.trim();
    const amountRaw = formData.get("amount") as string;
    const dueDateRaw = (formData.get("dueDate") as string)?.trim();
    const paymentTerms = (formData.get("paymentTerms") as string)?.trim();
    const termsText = (formData.get("termsText") as string)?.trim();
    const counterPartyEmail = (formData.get("counterPartyEmail") as string)?.trim();

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
    if (!subjectMatter) errors.subjectMatter = "Subject matter is required";
    if (!paymentTerms) errors.paymentTerms = "Payment terms are required";
    if (!termsText) errors.termsText = "Terms are required";

    const amount = parseFloat(amountRaw);
    if (!amountRaw || isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be a positive number";
    }

    const dueDate = dueDateRaw ? new Date(`${dueDateRaw}T00:00:00`) : null;
    if (dueDateRaw && Number.isNaN(dueDate?.getTime())) {
        errors.dueDate = "Enter a valid due date";
    }

    if (!counterPartyEmail) {
        errors.counterPartyEmail = "Counterparty email is required";
    } else if (!counterPartyEmail.includes("@")) {
        errors.counterPartyEmail = "Invalid email address";
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
            },
        });
    });

    redirect("/agreements");
}
