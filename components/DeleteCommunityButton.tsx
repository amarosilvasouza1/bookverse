'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteCommunity } from '@/app/actions/community-management';

interface DeleteCommunityButtonProps {
  communityId: string;
}

export default function DeleteCommunityButton({ communityId }: DeleteCommunityButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this community? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const result = await deleteCommunity(communityId);
      if (result.success) {
        router.push('/dashboard/communities');
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete community');
      }
    } catch (error) {
      console.error('Error deleting community:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-medium transition-colors border border-red-500/10 backdrop-blur-md"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
      Delete Community
    </button>
  );
}
