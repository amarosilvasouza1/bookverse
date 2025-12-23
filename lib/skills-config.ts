export type SkillType = 'passive' | 'cosmetic' | 'feature';

export interface Skill {
  id: string;
  label: string;
  description: string;
  type: SkillType;
  cost: number;
  requiredSkills: string[]; // IDs of parent skills
  position: { x: number; y: number }; // For visual layout on canvas
  icon: string; // Lucide icon name or emoji
}

export const SKILL_TREE_CONFIG: Skill[] = [
  // Root Node
  {
    id: 'novice_writer',
    label: 'Novice Writer',
    description: 'Begin your journey as an author.',
    type: 'passive',
    cost: 0,
    requiredSkills: [],
    position: { x: 400, y: 50 },
    icon: 'Feather',
  },
  
  // Left Branch (Writing Focus)
  {
    id: 'prolific_author',
    label: 'Prolific Author',
    description: 'Writing gives +10% more XP.',
    type: 'passive',
    cost: 1,
    requiredSkills: ['novice_writer'],
    position: { x: 250, y: 200 },
    icon: 'PenTool',
  },
  {
    id: 'storyteller',
    label: 'Master Storyteller',
    description: 'Unlock "Beta Reader" AI Analysis mode.',
    type: 'feature',
    cost: 3,
    requiredSkills: ['prolific_author'],
    position: { x: 250, y: 400 },
    icon: 'Sparkles',
  },
  {
    id: 'world_builder',
    label: 'World Builder',
    description: 'Create up to 50 Characters per book (Limit increased).',
    type: 'passive',
    cost: 2,
    requiredSkills: ['prolific_author'],
    position: { x: 100, y: 300 },
    icon: 'Globe',
  },

  // Right Branch (Reading/Social Focus)
  {
    id: 'avid_reader',
    label: 'Avid Reader',
    description: 'Reading gives +10% more XP.',
    type: 'passive',
    cost: 1,
    requiredSkills: ['novice_writer'],
    position: { x: 550, y: 200 },
    icon: 'BookOpen',
  },
  {
    id: 'social_butterfly',
    label: 'Social Butterfly',
    description: 'Unlock "Golden Name" in comments and chat.',
    type: 'cosmetic',
    cost: 3,
    requiredSkills: ['avid_reader'],
    position: { x: 550, y: 400 },
    icon: 'Crown',
  },
  {
    id: 'critic',
    label: 'Literary Critic',
    description: 'Unlock capability to rate books with half-stars.',
    type: 'feature',
    cost: 2,
    requiredSkills: ['avid_reader'],
    position: { x: 700, y: 300 },
    icon: 'Star',
  },

  // Central/Advanced
  {
    id: 'legend',
    label: 'Literary Legend',
    description: 'Unlock "Platinum" profile theme.',
    type: 'cosmetic',
    cost: 5,
    requiredSkills: ['storyteller', 'social_butterfly'],
    position: { x: 400, y: 600 },
    icon: 'Trophy',
  },

  // New Writing Skills
  {
    id: 'plot_architect',
    label: 'Plot Architect',
    description: 'Unlock "Outline Mode" visualizer.',
    type: 'feature',
    cost: 2,
    requiredSkills: ['prolific_author'],
    position: { x: 320, y: 280 },
    icon: 'GitBranch',
  },
  {
    id: 'character_psychologist',
    label: 'Character Psychologist',
    description: 'Unlock "Character Traits" randomizer.',
    type: 'feature',
    cost: 2,
    requiredSkills: ['world_builder'],
    position: { x: 50, y: 450 },
    icon: 'Brain',
  },
  {
    id: 'marathon_writer',
    label: 'Marathon Writer',
    description: '+5% Writing Speed Bonus.',
    type: 'passive',
    cost: 1,
    requiredSkills: ['prolific_author'],
    position: { x: 180, y: 400 },
    icon: 'Zap',
  },

  // New Social/Reading Skills
  {
    id: 'trendsetter',
    label: 'Trendsetter',
    description: 'Unlock "Animated Profile Picture" border.',
    type: 'cosmetic',
    cost: 4,
    requiredSkills: ['social_butterfly'],
    position: { x: 650, y: 550 },
    icon: 'Sparkles',
  },
  {
    id: 'book_club_host',
    label: 'Book Club Host',
    description: 'Ability to create Private Reading Rooms.',
    type: 'feature',
    cost: 3,
    requiredSkills: ['avid_reader'],
    position: { x: 700, y: 450 },
    icon: 'Users',
  },
  {
    id: 'generous_soul',
    label: 'Generous Soul',
    description: 'Unlock "Gift Animation" effects.',
    type: 'cosmetic',
    cost: 2,
    requiredSkills: ['social_butterfly'],
    position: { x: 480, y: 500 },
    icon: 'Gift',
  },

  // Ultimate Skill
  {
    id: 'grand_archmage',
    label: 'Grand Archmage',
    description: 'Unlock "Rainbow User Name" effect.',
    type: 'cosmetic',
    cost: 10,
    requiredSkills: ['legend'],
    position: { x: 400, y: 750 },
    icon: 'Wand2',
  },
];
