import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getShopCosmetics, getUserCosmetics } from "@/app/actions/cosmetics";
import CosmeticShopClient from "./client";

export default async function CosmeticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = { 
    id: session.id as string, 
    username: (session.name as string) || "User", 
    email: (session.email as string) || "", 
    image: (session.image as string) || null 
  };

  const [shopResult, inventoryResult] = await Promise.all([
    getShopCosmetics(),
    getUserCosmetics(user.id)
  ]);

  const shopItems = (shopResult.success && shopResult.data) ? shopResult.data : [];
  const inventoryItems = (inventoryResult.success && inventoryResult.data) ? inventoryResult.data : [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-white mb-2">Ink Shop</h1>
           <p className="text-zinc-400">Customize your profile with frames and bubbles created by the community.</p>
         </div>
         <div className="text-right">
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Your Ink</p>
            {/* @ts-expect-error ink field may not exist on session user type */}
            <p className="text-2xl font-bold text-purple-400">{user.ink || 0} 💧</p>
         </div>
      </div>
      
      <CosmeticShopClient 
        user={user} 
        initialShop={shopItems} 
        initialInventory={inventoryItems} 
      />
    </div>
  );
}
