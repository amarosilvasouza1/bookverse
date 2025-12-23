import { Suspense } from 'react';
import { getUserSkillTree } from '@/app/actions/skills';
import SkillTreeCanvas from './components/SkillTreeCanvas';
import { Loader2 } from 'lucide-react';

import SkillsHeader from './components/SkillsHeader';

export default async function SkillsPage() {
  const { data, error } = await getUserSkillTree();
  
  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-red-400">
        <p>Failed to load skill tree data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 p-4 md:p-8">
      <SkillsHeader />

      <div className="flex-1 w-full max-w-5xl mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-[500px]"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>}>
          <SkillTreeCanvas 
            unlockedSkills={data.unlockedSkills} 
            points={data.points} 
          />
        </Suspense>
      </div>
    </div>
  );
}
