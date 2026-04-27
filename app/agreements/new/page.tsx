import { getSession } from "@/lib/session";
import { redirect } from "next/navigation"
import CreateAgreementForm from "./CreateAgreementForm";

export default async function NewAgreementsPage() {
    
    const session = await getSession();
        
    if (!session) {
        redirect("/login");
    }
    return (
        <main>
            <h1>Create Agreement</h1>
            <CreateAgreementForm />
        </main>
    );
}