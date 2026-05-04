import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SignCreatorForm from "./SignCreatorForm"
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"
export default async function SignCreatorAgreementPage({
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

    if (agreement.createdById !== session.id) {
        return(
            <main>
                <h1>Cannot Sign This Agreement</h1>
                <p>Only the creator can sign on this page.</p>
                <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            </main>
        )
    }

    if (agreement.status === "FINALIZED"){
        return (
            <main>
                <h1>Agreement Already Signed</h1>
                <p>This agreement has already been signed and cannot be signed again.</p>
                <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            </main>
        )
    } else if (agreement.status !== "SIGNED_BY_COUNTERPARTY") {
        return (
            <main>
                <h1>Cannot Sign Yet</h1>
                <p>The counterparty has not signed the agreement yet.</p>
                <Link href={`/agreements/${agreement.id}`}>← Back to Agreement Details</Link>
            </main>
        )
    }

    const creatorParty = agreement.parties.find(p => p.role === "CREATOR");
    if (!creatorParty) notFound();
            
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
            <SignCreatorForm
                agreementId={agreement.id}
                creatorName={creatorParty.fullName}
            />
        </main>
    );
}
