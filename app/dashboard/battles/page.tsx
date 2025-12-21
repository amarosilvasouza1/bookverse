import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveBattles } from "@/app/actions/battles";
import BattleLobbyClient from "./client";

export default async function BattlesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getActiveBattles();
  const battles = result.success ? result.data : [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
         <h1 className="text-3xl font-bold text-white">Writing Battles</h1>
         <p className="text-zinc-400">Compete with other writers in real-time. Highest vote wins.</p>
      </div>
      
      {/* @ts-expect-error Prisma/Server Action return type mismatch usually manageable */}
      <BattleLobbyClient battles={battles} userId={session.id as string} />
    </div>
  );
}
