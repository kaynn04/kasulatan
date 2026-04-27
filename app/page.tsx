import PageIntro from "@/components/PageIntro";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const userCount = await prisma.user.count();
  return (
    <main>
      <PageIntro
        title="Welcome to Kasulatan"
        description="A digital agreement and transaction record platform."
      />

      <p>Total users in database: {userCount}</p>
    </main>
  );
}
