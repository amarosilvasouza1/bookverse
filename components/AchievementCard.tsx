import { Trophy, BookOpen, Feather, MessageCircle, Megaphone } from 'lucide-react';

const icons = {
  Trophy,
  BookOpen,
  Feather,
  MessageCircle,
  Megaphone,
};

interface AchievementCardProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
  unlockedAt?: Date;
}

export default function AchievementCard({ achievement, unlockedAt }: AchievementCardProps) {
  const Icon = icons[achievement.icon as keyof typeof icons] || Trophy;

  return (
    <div className={`p-4 rounded-xl border ${unlockedAt ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10 opacity-50'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${unlockedAt ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{achievement.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-yellow-400">+{achievement.xpReward} XP</span>
            {unlockedAt && (
              <span className="text-muted-foreground">• Unlocked {new Date(unlockedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
