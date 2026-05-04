import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"

export default async function AgreementDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getSession();
    
    if (!session) {
        redirect("/login");
    }
    
    const agreement = await prisma.agreement.findFirst({
        where: { 
            id,
            OR: [
                { createdById: session.id },
                { parties: { some: { email: session.email, role: "COUNTERPARTY" } } },
            ]
        },
        include: {
            parties: true, // <- fetch related parties for display
        },
    });

    if (!agreement) notFound();

    // Separate parties by role for easier display
    const creator = agreement.parties.find(p => p.role === "CREATOR");
    const counterParty = agreement.parties.find(p => p.role === "COUNTERPARTY");

    const isCreatorViewer = agreement.createdById === session.id;
    const isCounterpartyViewer =
        !!counterParty &&
        counterParty.email.toLowerCase() === session.email.toLowerCase();
    return (
        <main>
            <Link href="/agreements">← Back to Agreements</Link>
            <h1>{agreement.title}</h1>
            <p>Type: {agreement.agreementType}</p>
            <p>Subject: {agreement.subjectMatter}</p>
            <p>Amount: PHP {agreement.amount.toString()}</p>
            <p>Status: {agreement.status}</p>
            <p>Reference: {agreement.referenceNumber}</p>

            <h2>Parties</h2>

            <div>
                <h3>Creator</h3>
                {creator ? (
                    <>
                        <p>Name: {creator.fullName}</p>
                        <p>Email: {creator.email}</p>
                        <p>Mobile: {creator.mobileNumber}</p>

                        {creator.signedAt ? (
                            <>
                                <p>Signed: ✅</p>
                                <p>Signature: {creator.typedSignature}</p>
                                <p>Signed at: {creator.signedAt.toLocaleString()}</p>
                                <p>Read agreement: {creator.confirmedReadAgreement ? "Yes" : "No"}</p>
                                <p>Consented to e-signature: {creator.consentedToElectronicSignature ? "Yes" : "No"}</p>
                            </>
                        ): (
                            <>
                                <p>Not yet signed</p>
                                {isCreatorViewer && (
                                    <Link href={`/agreements/${agreement.id}/sign-creator`}>
                                        Start signing
                                    </Link>
                                )}
                            </>
                        )}
                    </>
                ): (
                    <p>No creator information available.</p>
                )}
            </div>

            <div>
                <h3>Counterparty</h3>
                {counterParty ? (
                    <>
                        <p>Name: {counterParty.fullName}</p>
                        <p>Email: {counterParty.email}</p>
                        <p>Mobile: {counterParty.mobileNumber}</p>

                        {counterParty.signedAt ? (
                            <>
                                <p>Signed: ✅</p>
                                <p>Signature: {counterParty.typedSignature}</p>
                                <p>Signed at: {counterParty.signedAt.toLocaleString()}</p>
                                <p>Read agreement: {counterParty.confirmedReadAgreement ? "Yes" : "No"}</p>
                                <p>Consented to e-signature: {counterParty.consentedToElectronicSignature ? "Yes" : "No"}</p>
                            </>
                        ): (
                            <>
                            <p>Not yet signed</p>
                            {isCounterpartyViewer ? (
                                <Link href={`/agreements/${agreement.id}/sign-counter`}>
                                    Start signing
                                </Link>
                            ) : (
                                <p>Send to counterparty for signing.</p>
                            )}
                        </>
                        )}
                    </>
                ) : (
                    <p>No counterparty information available.</p>
                )}
            </div>
        </main>
    );
}