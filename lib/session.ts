import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "sessionId";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function createSession(userId: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
        return null;
    }

    const session = await prisma.user.findUnique({
        where: { id: sessionId },
        select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
            addressLine: true,
            barangay: true,
            cityMunicipality: true,
            province: true,
            postalCode: true,
        },
    });
    return session;
}
