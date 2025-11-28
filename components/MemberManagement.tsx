'use client';

import { useState } from 'react';
import { MoreVertical, Shield, ShieldOff, UserX, Loader2 } from 'lucide-react';
import { removeMember, promoteToAdmin, demoteAdmin } from '@/app/actions/community-management';
import { useRouter } from 'next/navigation';

interface MemberManagementProps {
  communityId: string;
  memberId: string;
  memberRole: string; // 'ADMIN' | 'MEMBER'
  isTargetOwner: boolean;
  currentUserRole: string | null; // 'ADMIN' | 'MEMBER' | null
  isCurrentUserOwner: boolean;
}

export default function MemberManagement({
  communityId,
  memberId,
  memberRole,
  isTargetOwner,
  currentUserRole,
  isCurrentUserOwner
}: MemberManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Determine permissions
  const canRemove = isCurrentUserOwner || (currentUserRole === 'ADMIN' && memberRole !== 'ADMIN' && !isTargetOwner);
  const canPromote = isCurrentUserOwner && memberRole !== 'ADMIN';
  const canDemote = isCurrentUserOwner && memberRole === 'ADMIN';

  if (!canRemove && !canPromote && !canDemote) return null;

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true);
    setIsOpen(false);
    try {
      const result = await action();
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Action failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1">
            {canPromote && (
              <button
                onClick={() => handleAction(() => promoteToAdmin(communityId, memberId))}
                className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-white/5 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Make Admin
              </button>
            )}
            {canDemote && (
              <button
                onClick={() => handleAction(() => demoteAdmin(communityId, memberId))}
                className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-white/5 flex items-center gap-2"
              >
                <ShieldOff className="w-4 h-4" /> Remove Admin
              </button>
            )}
            {canRemove && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove this member?')) {
                    handleAction(() => removeMember(communityId, memberId));
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
              >
                <UserX className="w-4 h-4" /> Remove Member
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
