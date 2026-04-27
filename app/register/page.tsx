import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default async function RegisterUserPage(){
    return (
        <main>
            <h1>Registration Page</h1>

            <RegisterForm />

            <Link href={`./login`}>Already have an account? Login</Link>
        </main>
    )
}