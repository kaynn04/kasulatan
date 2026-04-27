"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function logoutUser() {
    // Clear the session cookie by setting it to an empty value and an expired date
    const cookieStore = await cookies();
    cookieStore.set({
        name: "sessionId",
        value: "",
        expires: new Date(0), // Set the cookie to expire in the past
    });

    redirect("/login");
}