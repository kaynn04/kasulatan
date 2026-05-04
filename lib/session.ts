// lib/session.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
        return null;
    }

    // Look up the session in the database
    const session = await prisma.user.findUnique({
        where: { id: sessionId },
        select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
        },
    });
    return session;
}