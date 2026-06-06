import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
    scope: string;
    identifier: string;
    limit: number;
    windowSeconds: number;
};

function hashIdentifier(scope: string, identifier: string) {
    return createHash("sha256")
        .update(`${scope}:${identifier}`)
        .digest("hex");
}

export async function getClientIp() {
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");

    return forwardedFor?.split(",")[0]?.trim()
        || headerStore.get("x-real-ip")
        || null;
}

export async function consumeRateLimit({
    scope,
    identifier,
    limit,
    windowSeconds,
}: RateLimitOptions) {
    const key = hashIdentifier(scope, identifier);
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowSeconds * 1000);

    const [entry] = await prisma.$queryRaw<Array<{ attempts: number }>>`
        INSERT INTO "AuthRateLimit" ("key", "attempts", "resetAt", "updatedAt")
        VALUES (${key}, 1, ${resetAt}, ${now})
        ON CONFLICT ("key") DO UPDATE SET
            "attempts" = CASE
                WHEN "AuthRateLimit"."resetAt" <= ${now} THEN 1
                ELSE "AuthRateLimit"."attempts" + 1
            END,
            "resetAt" = CASE
                WHEN "AuthRateLimit"."resetAt" <= ${now} THEN ${resetAt}
                ELSE "AuthRateLimit"."resetAt"
            END,
            "updatedAt" = ${now}
        RETURNING "attempts"
    `;

    return Boolean(entry && entry.attempts <= limit);
}
