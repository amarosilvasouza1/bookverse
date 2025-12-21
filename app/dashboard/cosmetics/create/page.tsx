'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createAuthorCosmetic } from '@/app/actions/cosmetics';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function CreateCosmeticPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [type, setType] = useState<'FRAME' | 'BUBBLE'>('FRAME');
  const [price, setPrice] = useState(100);
  const [imageUrl, setImageUrl] = useState(''); // In real app, would use upload
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setLoading(true);
    const result = await createAuthorCosmetic(session.user.id, name, type, imageUrl, price);
    
    if (result.success) {
        toast.success("Cosmetic Created!");
        router.push('/dashboard/cosmetics');
    } else {
        toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/cosmetics" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Cosmetic</h1>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-400">Name</label>
             <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none"
                placeholder="Ex: Golden Flame Frame"
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Type</label>
                <select
                    value={type}
                    onChange={e => setType(e.target.value as 'FRAME' | 'BUBBLE')}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none"
                >
                    <option value="FRAME">Avatar Frame</option>
                    <option value="BUBBLE">Chat Bubble</option>
                </select>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Price (Ink)</label>
                <input 
                    type="number" 
                    required
                    min="0"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none"
                />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-400">Image URL</label>
             <div className="flex gap-2">
                <input 
                    type="url" 
                    required
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none"
                    placeholder="https://imgur.com/..."
                />
             </div>
             <p className="text-xs text-zinc-600">Enter a direct image link for now.</p>
           </div>
           
           {/* Preview */}
           <div className="p-6 bg-black/30 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview</span>
              {type === 'FRAME' ? (
                  <div className="w-24 h-24 rounded-full bg-zinc-700 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0" style={{ 
                          backgroundImage: `url(${imageUrl})`, 
                          backgroundSize: 'cover',
                          border: '4px solid transparent' // Mock
                      }} />
                      <span className="text-[10px] text-zinc-400 z-10 relative">User</span>
                  </div>
              ) : (
                  <div className="bg-zinc-800 p-4 rounded-lg text-white text-sm max-w-[200px]" style={{
                      borderImage: imageUrl ? `url(${imageUrl}) 30 fill` : undefined
                  }}>
                      Hello! This is how my chat bubble will look.
                  </div>
              )}
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
           >
             {loading ? 'Creating...' : <><Save className="w-4 h-4" /> Publish Cosmetic</>}
           </button>
        </form>
      </div>
    </div>
  );
}
