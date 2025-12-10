'use client';

import { useState, useEffect } from 'react';
import { getMutualFollowersForChat, sendMessage } from '@/app/actions/chat';
import { X, Search, Send, Check } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
}

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    author: {
        username: string;
    };
  };
}

export default function SharePostModal({ isOpen, onClose, post }: SharePostModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  async function loadFriends() {
    setLoading(true);
    const data = await getMutualFollowersForChat();
    setUsers(data as unknown as User[]);
    setLoading(false);
  }

  const handleSend = async (userId: string) => {
    setSendingTo(userId);
    
    // Construct the share message
    // We use a special URL format that ChatInterface can recognize or just a clickable link
    const postUrl = `${window.location.origin}/dashboard/community-post/${post.id}`; // Hypothetical deep link
    const message = `Check out this post by @${post.author.username}: ${post.content.substring(0, 50)}...`;

    const result = await sendMessage(userId, message); // We might want to pass post metadata in future
    
    setSendingTo(null);
    if (!result.error) {
       toast.success('Sent!');
    } else {
       toast.error('Failed to send');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
          <h3 className="font-bold text-white">Share Post</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text"
               placeholder="Search friends..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white"
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
           {loading ? (
             <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
           ) : filteredUsers.length === 0 ? (
             <div className="text-center p-8 text-gray-500">No friends found.</div>
           ) : (
             <div className="space-y-1">
               {filteredUsers.map(user => (
                 <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                        {user.image ? (
                           <Image src={user.image} alt="" fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center font-bold text-white bg-zinc-700">
                             {user.username[0].toUpperCase()}
                           </div>
                        )}
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => handleSend(user.id)}
                     disabled={sendingTo === user.id}
                     className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                   >
                     {sendingTo === user.id ? 'Sending...' : <><Send className="w-3 h-3" /> Send</>}
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
