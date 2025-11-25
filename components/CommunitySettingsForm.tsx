'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCommunity, approveMember, rejectMember } from '@/app/actions/community-management';
import { Loader2, Save, Check, X, Shield, User } from 'lucide-react';

interface CommunitySettingsFormProps {
  community: any;
}

export default function CommunitySettingsForm({ community }: CommunitySettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      alert('Community updated successfully');
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleApprove = async (memberId: string) => {
    if (!confirm('Approve this member?')) return;
    const result = await approveMember(community.id, memberId);
    if (result.success) router.refresh();
  };

  const handleReject = async (memberId: string) => {
    if (!confirm('Reject/Remove this member?')) return;
    const result = await rejectMember(community.id, memberId);
    if (result.success) router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="glass-card p-6 rounded-xl border border-white/10 space-y-6">
        <h2 className="text-xl font-bold">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 [&>option]:bg-zinc-900"
            >
              <option value="OPEN">Open (Anyone can join)</option>
              <option value="CLOSED">Closed (Requires approval)</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Join Requests */}
      {pendingMembers.length > 0 && (
        <div className="glass-card p-6 rounded-xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Join Requests
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{pendingMembers.length}</span>
          </h2>
          
          <div className="space-y-3">
            {pendingMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {member.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.user.username}</p>
                    <p className="text-xs text-muted-foreground">Requested {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(member.id)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="glass-card p-6 rounded-xl border border-white/10 space-y-6">
        <h2 className="text-xl font-bold">Members ({activeMembers.length})</h2>
        
        <div className="space-y-3">
          {activeMembers.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {member.user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {member.user.username}
                    {member.role === 'ADMIN' && <Shield className="w-3 h-3 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {member.role !== 'ADMIN' && (
                <button
                  onClick={() => handleReject(member.id)}
                  className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                  title="Remove Member"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
