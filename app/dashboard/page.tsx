import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"
import PageIntro from "@/components/PageIntro";
import Logout from "@/components/Logout";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }
    return (
    <main>
        <PageIntro
            title="Dashboard"
            description="Manage your agreements and transactions here."
        />
        <Logout />
    </main>
    );
}