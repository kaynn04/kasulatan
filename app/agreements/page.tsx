import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"

export default async function AgreementsPage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    const agreements = await prisma.agreement.findMany({
        where: {
            OR: [
                { createdById: session.id },
                { parties: { some: { email: session.email, role: "COUNTERPARTY" } } },
            ]
        },
        include: {
            parties: true, // Include parties to determine if the user is a counterparty
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const createdByMe = agreements.filter((agreement) => agreement.createdById === session.id);
    const asCounterparty = agreements.filter((agreement) => agreement.parties.some((party) => party.role === "COUNTERPARTY" && party.email.toLowerCase() === session.email.toLowerCase()));

    return (
        <main>
            <h1>Agreements</h1>

            <section>
                <h2>Created by Me </h2>
                {createdByMe.length === 0 ? (
                    <p>No agreements created by you.</p>
                ) : (
                    <ul>
                        {createdByMe.map((agreement) => (
                            <li key={agreement.id}>
                                <Link href={`/agreements/${agreement.id}`}>
                                    <strong>{agreement.title}</strong> - {agreement.agreementType} - PHP {" "}
                                    {agreement.amount.toString()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Where I am counterparty</h2>
                {asCounterparty.length === 0 ? (
                    <p>No agreements where you are a counterparty.</p>
                ) : (
                    <ul>
                        {asCounterparty.map((agreement) => (
                            <li key={agreement.id}>
                                <Link href={`/agreements/${agreement.id}`}>
                                    <strong>{agreement.title}</strong> - {agreement.agreementType} - PHP {" "}
                                    {agreement.amount.toString()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}