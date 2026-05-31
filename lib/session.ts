import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "kasulatanSession";
const LEGACY_SESSION_COOKIE = "sessionId";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

async function revokeCookieSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
        await prisma.session.deleteMany({
            where: { tokenHash: hashToken(token) },
        });
    }
}

export async function createSession(userId: string) {
    const cookieStore = await cookies();
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await revokeCookieSession();
    await prisma.session.create({
        data: {
            tokenHash: hashToken(token),
            userId,
            expiresAt,
        },
    });

    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
    cookieStore.delete(LEGACY_SESSION_COOKIE);
}

export async function deleteSession() {
    const cookieStore = await cookies();

    await revokeCookieSession();
    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete(LEGACY_SESSION_COOKIE);
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: { tokenHash: hashToken(token) },
        select: {
            expiresAt: true,
            user: {
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
            },
        },
    });

    if (!session || session.expiresAt <= new Date()) {
        return null;
    }

    return session.user;
}
