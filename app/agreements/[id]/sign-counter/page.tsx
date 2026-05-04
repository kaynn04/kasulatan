import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SignForm from "./SignForm";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"

export default async function SignAgreementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const agreement = await prisma.agreement.findUnique({
        where: { id },
        include: {
            parties: true,
        },
    });

    if (!agreement) notFound();

    const counterParty = agreement.parties.find(p => p.role === "COUNTERPARTY");

    if (!counterParty) notFound();

    if (counterParty.email !== session.email) {
        return (
            <main>
                <h1>Cannot Sign Your Own Agreement</h1>
                <p>You are the creator of this agreement and cannot sign it as a counterparty.</p>
                <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            </main>
        )
    }

    if (agreement.status !== "DRAFT") {
        return (
            <main>
                <h1>Agreement Already Signed</h1>
                <p>This agreement has already been signed and cannot be signed again.</p>
                <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            </main>
        )
    }
            
    return (
        <main>
            <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            <h1>Sign Agreement</h1>

            <h2>{agreement.title}</h2>
            <p>Type: {agreement.agreementType}</p>
            <p>Subject: {agreement.subjectMatter}</p>
            <p>Amount: PHP {agreement.amount.toString()}</p>
            <p>Payment Terms: {agreement.paymentTerms}</p>

            <h3>Terms</h3>
            <p>{agreement.termsText}</p>

            <hr />

            <h3>Your Signature</h3>
            <SignForm
                agreementId={agreement.id}
                counterPartyName={counterParty.fullName}
            />
        </main>
    );
}
