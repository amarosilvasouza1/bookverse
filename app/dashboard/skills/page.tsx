import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSkillTree } from "@/app/actions/rpg";
import SkillTreeClient from "./client";

export default async function SkillsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getUserSkillTree();
  const tree = result.success ? result.data : { points: 0, unlockedSkills: "[]" };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
         <h1 className="text-3xl font-bold text-white">Reader Skills</h1>
         <p className="text-zinc-400">Unlock abilities to enhance your reading and writing journey.</p>
      </div>
      
      <SkillTreeClient initialData={tree} />
    </div>
  );
}
