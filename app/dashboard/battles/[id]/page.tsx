import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBattleState } from "@/app/actions/battles";
import BattleRoomClient from "./client";

export default async function BattleRoomPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.id) redirect("/login");

  const result = await getBattleState(params.id);
  
  if (!result.success || !result.data) {
      redirect("/dashboard/battles"); // Or show error
  }

  return <BattleRoomClient initialBattle={result.data} userId={session.id as string} />;
}
