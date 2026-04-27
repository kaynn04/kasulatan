import LoginForm from "./LoginForm";
import Link from "next/link";


export default function LoginPage() {
    return (
        <main>
            <h1>Login Page</h1>

            <LoginForm />

            <Link href={`./register`}>Don&apos;t have an account? Register</Link>
        </main>
    );
}