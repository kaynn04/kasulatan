import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
    const user = await prisma.user.create({
        data: {
            name: "Juan Dela Cruz",
            email: "juan@example.com",
            passwordHash: "sample-hash-for-now",
        },
    });

    console.log("Created user:", user);
}

main()
    .catch((error) => {
        console.error("Error creating user:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });