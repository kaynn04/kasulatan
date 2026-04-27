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
        orderBy: {
            createdAt: "desc",
        },
    });
    return (
        <main>
            <h1>Agreements</h1>
            {agreements.length === 0 ? (
                <p>No agreements found.</p>
            ) : (
                <ul>
                    {agreements.map((agreement) => (
                        <li key={agreement.id}>
                            <Link href={`/agreements/${agreement.id}`}>
                                <strong>{agreement.title}</strong> - {agreement.agreementType} - PHP {" "}
                                {agreement.amount.toString()}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}