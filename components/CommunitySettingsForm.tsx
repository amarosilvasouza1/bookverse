'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCommunity, approveMember, rejectMember } from '@/app/actions/community-management';
import { Loader2, Save, Check, X, Shield, User, Globe, Lock, Users, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CommunitySettingsFormProps {
  community: any;
}

export default function CommunitySettingsForm({ community }: CommunitySettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'requests'>('overview');
  
  // Form State
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description || '');
  const [privacy, setPrivacy] = useState(community.privacy);

  // Filter members
  const pendingMembers = community.members.filter((m: any) => m.status === 'PENDING');
  const activeMembers = community.members.filter((m: any) => m.status === 'APPROVED');

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateCommunity(community.id, { name, description, privacy });
    setLoading(false);
    
    if (result.success) {
      router.refresh();
      // Ideally show toast here
    } else {
      alert(result.error);
    }
  };

  const handleApprove = async (memberId: string) => {
    const result = await approveMember(community.id, memberId);
    if (result.success) router.refresh();
  };

  const handleReject = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    const result = await rejectMember(community.id, memberId);
    if (result.success) router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Settings Navigation */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'overview' ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'members' ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-4 h-4" /> Members
          <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{activeMembers.length}</span>
        </button>
        {pendingMembers.length > 0 && (
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'requests' ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            Requests
            <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full ml-1 shadow-lg shadow-primary/20 animate-pulse">{pendingMembers.length}</span>
          </button>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2">Community Overview</h2>
            <p className="text-gray-400">Manage your community's identity and privacy.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 ml-1">Community Name</label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border-2 border-white/5 rounded-2xl px-5 py-4 text-lg text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-700"
                  placeholder="e.g. The Book Club"
                />
                <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-black/20 border-2 border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                placeholder="What is this community about?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 ml-1">Privacy Level</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPrivacy('OPEN')}
                  className={cn(
                    "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group",
                    privacy === 'OPEN' ? "bg-primary/10 border-primary/50" : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className={cn("p-3 rounded-xl", privacy === 'OPEN' ? "bg-primary text-white" : "bg-zinc-800 text-gray-400")}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Open Community</h4>
                    <p className="text-xs text-gray-400">Anyone can find and join.</p>
                  </div>
                  {privacy === 'OPEN' && <Check className="w-5 h-5 text-primary ml-auto" />}
                </div>

                <div 
                  onClick={() => setPrivacy('CLOSED')}
                  className={cn(
                    "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group",
                    privacy === 'CLOSED' ? "bg-primary/10 border-primary/50" : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className={cn("p-3 rounded-xl", privacy === 'CLOSED' ? "bg-primary text-white" : "bg-zinc-800 text-gray-400")}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Closed Community</h4>
                    <p className="text-xs text-gray-400">Requires approval to join.</p>
                  </div>
                  {privacy === 'CLOSED' && <Check className="w-5 h-5 text-primary ml-auto" />}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-white/5 hover:scale-105 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden min-h-[400px]">
          <div className="p-8 border-b border-white/5 bg-black/20">
             <h2 className="text-2xl font-bold text-white mb-2">Join Requests</h2>
             <p className="text-gray-400">Review people who want to join your tribe.</p>
          </div>
          
          <div className="p-4 space-y-2">
            {pendingMembers.length === 0 ? (
               <div className="text-center py-20 text-gray-500">
                  No pending requests at the moment.
               </div>
            ) : (
                pendingMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg text-white overflow-hidden relative">
                         {member.user.image ? (
                           <Image src={member.user.image} alt="" fill className="object-cover" />
                         ) : (
                            member.user.username[0].toUpperCase()
                         )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{member.user.username}</p>
                        <p className="text-sm text-gray-400">Requested {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(member.id)}
                        className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(member.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden min-h-[500px]">
           <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h2 className="text-2xl font-bold text-white mb-2">Members</h2>
                <p className="text-gray-400">Manage your community members.</p>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 w-full md:w-64"
                />
             </div>
          </div>
          
          <div className="p-4 space-y-2">
            {activeMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg text-white overflow-hidden relative">
                        {member.user.image ? (
                           <Image src={member.user.image} alt="" fill className="object-cover" />
                         ) : (
                            member.user.username[0].toUpperCase()
                         )}
                    </div>
                    {member.role === 'ADMIN' && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-zinc-900 shadow-sm" title="Admin">
                        <Shield className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-white text-lg">{member.user.username}</p>
                       {member.role === 'ADMIN' && <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>}
                    </div>
                    <p className="text-sm text-gray-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {member.role !== 'ADMIN' && (
                  <button
                    onClick={() => handleReject(member.id)}
                    className="w-10 h-10 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Member"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
