import { Plus, Trash2, Users, Wand2, Book, User, Settings, ImageIcon, DollarSign, X, Music, Calendar } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterSettings from '@/components/CharacterSettings';
import AiPanel from './AiPanel';
import ImageUpload from '@/components/ImageUpload';
import { useLanguage } from '@/context/LanguageContext';

interface Page {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
  scheduledAt?: string;
}

interface Collaborator {
  id: string;
  userId: string;
  user: {
    username: string;
  };
}

interface EditorSidebarProps {
  activeTab: 'pages' | 'collaborators' | 'ai' | 'characters' | 'settings';
  setActiveTab: (tab: 'pages' | 'collaborators' | 'ai' | 'characters' | 'settings') => void;
  pages: Page[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  handleAddPage: () => void;
  handleDeletePage: (index: number, e: React.MouseEvent) => void;
  handleSchedulePage: (index: number, date: string) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  collaborators: Collaborator[];
  collaboratorSearch: string;
  setCollaboratorSearch: (value: string) => void;
  handleAddCollaborator: () => void;
  handleRemoveCollaborator: (userId: string) => void;
  bookId?: string;
  // AI Props
  apiKey: string;
  setApiKey: (key: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
  aiMode: 'complete' | 'structure' | 'page' | 'analyze';
  setAiMode: (mode: 'complete' | 'structure' | 'page' | 'analyze') => void;
  isGenerating: boolean;
  handleGenerateAI: () => void;
  // Settings Props
  coverImage: string;
  setCoverImage: (url: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  price: string;
  setPrice: (price: string) => void;
  allowDownload: boolean;
  setAllowDownload: (allow: boolean) => void;
  ambience: string;
  setAmbience: (ambience: string) => void;
}

function SortablePageItem({ page, index, isActive, onClick, onDelete, onSchedule }: { 
  page: Page, 
  index: number, 
  isActive: boolean, 
  onClick: () => void, 
  onDelete: (e: React.MouseEvent) => void,
  onSchedule: (date: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });
  
  const { t } = useLanguage();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-2">
      <button
        onClick={onClick}
        className={`w-full text-left p-3 pl-4 rounded-xl border transition-all duration-200 group-hover:border-white/10 ${
          isActive
            ? 'bg-white/10 border-white/20 text-white shadow-lg backdrop-blur-sm'
            : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`font-medium text-xs uppercase tracking-wider ${isActive ? 'text-indigo-400' : ''}`}>
            {t('pageIndex')} {index + 1}
          </span>
          <div className="flex items-center gap-2">
            {/* Schedule Button */}
            <div className="relative group/schedule" onClick={(e) => e.stopPropagation()}>
              <Calendar className={`w-3.5 h-3.5 cursor-pointer transition-colors ${page.scheduledAt ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100'}`} />
              <input
                type="datetime-local"
                value={page.scheduledAt || ''}
                onChange={(e) => onSchedule(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {page.scheduledAt && (
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[10px] whitespace-nowrap text-white pointer-events-none opacity-0 group-hover/schedule:opacity-100 transition-opacity z-50">
                  {new Date(page.scheduledAt).toLocaleString()}
                </div>
              )}
            </div>

            <div 
              {...attributes} 
              {...listeners}
              className="opacity-0 group-hover:opacity-50 hover:opacity-100! cursor-grab active:cursor-grabbing p-1"
            >
              <div className="w-4 h-4 flex flex-col justify-center gap-[2px]">
                <div className="w-full h-px bg-current" />
                <div className="w-full h-px bg-current" />
                <div className="w-full h-px bg-current" />
              </div>
            </div>
            <Trash2
              className="w-3.5 h-3.5 text-zinc-500 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
            />
          </div>
        </div>
        <p className="text-sm font-serif truncate opacity-80 pl-1 border-l-2 border-white/5 group-hover:border-white/10">
          {page.title || t('untitledPage')}
        </p>
      </button>
    </div>
  );
}

export default function EditorSidebar({
  activeTab,
  setActiveTab,
  pages,
  currentPageIndex,
  setCurrentPageIndex,
  handleAddPage,
  handleDeletePage,
  handleSchedulePage,
  handleDragEnd,
  collaborators,
  collaboratorSearch,
  setCollaboratorSearch,
  handleAddCollaborator,
  handleRemoveCollaborator,
  bookId,
  // AI Props
  apiKey,
  setApiKey,
  aiPrompt,
  setAiPrompt,
  pageCount,
  setPageCount,
  aiMode,
  setAiMode,
  isGenerating,
  handleGenerateAI,
  // Settings Props
  coverImage,
  setCoverImage,
  description,
  setDescription,
  genre,
  setGenre,
  isPremium,
  setIsPremium,
  price,
  setPrice,
  allowDownload,
  setAllowDownload,
  ambience,
  setAmbience,
}: EditorSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { t } = useLanguage();

  const tabs = [
    { id: 'pages', icon: Book, label: t('pagesTab') },
    { id: 'settings', icon: Settings, label: t('settingsTab') },
    { id: 'collaborators', icon: Users, label: t('teamTab') },
    { id: 'ai', icon: Wand2, label: t('aiTab') },
    { id: 'characters', icon: User, label: t('charsTab') },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]/50 backdrop-blur-xl border-r border-white/5">
      {/* Tabs */}
      <div className="p-1 sm:p-2 grid grid-cols-5 gap-0.5 sm:gap-1 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 sm:py-3 px-0.5 sm:px-1 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
            <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-wider truncate w-full text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'pages' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('structure')}</h3>
                <span className="text-xs text-zinc-600">{pages.length} {t('pagesCountLabel')}</span>
              </div>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={pages.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {pages.map((page, index) => (
                    <SortablePageItem
                      key={page.id}
                      page={page}
                      index={index}
                      isActive={currentPageIndex === index}
                      onClick={() => setCurrentPageIndex(index)}
                      onDelete={(e) => handleDeletePage(index, e)}
                      onSchedule={(date) => handleSchedulePage(index, date)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              <button
                onClick={handleAddPage}
                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-zinc-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {t('addNewPage')}
              </button>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Cover Image */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  {t('coverImage')}
                </label>
                <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                  <ImageUpload
                    label={t('uploadCover')}
                    value={coverImage}
                    onChange={setCoverImage}
                    aspectRatio="portrait"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('description')}</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-white/20 transition-colors resize-none h-24 placeholder:text-zinc-700 text-zinc-300"
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('genres')}</label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {genre.split(',').filter(Boolean).map((g) => (
                        <span key={g} className="px-2 py-1 bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                          {g}
                          <button
                            onClick={() => {
                              const newGenres = genre.split(',').filter(i => i !== g).join(',');
                              setGenre(newGenres);
                            }}
                            className="hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select 
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !genre.includes(e.target.value)) {
                          setGenre(genre ? `${genre},${e.target.value}` : e.target.value);
                        }
                      }}
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-2 text-xs focus:outline-none focus:border-white/20 transition-colors [&>option]:bg-zinc-900 appearance-none cursor-pointer hover:bg-black/30 text-zinc-400"
                    >
                      <option value="">{t('addGenre')}</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Romance">Romance</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Horror">Horror</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Historical">Historical</option>
                      <option value="Biography">Biography</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Poetry">Poetry</option>
                      <option value="Young Adult">Young Adult</option>
                      <option value="Children">Children</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Monetization */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      {t('premiumContent')}
                    </label>
                    <p className="text-[10px] text-zinc-600">{t('monetizeBook')}</p>
                  </div>
                  <button 
                    onClick={() => setIsPremium(!isPremium)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${isPremium ? 'bg-purple-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${isPremium ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                {isPremium && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">{t('priceLabel')}</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9.99"
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 transition-colors text-white"
                    />
                  </div>
                )}
              </div>

              {/* Download Settings */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Book className="w-3 h-3" />
                      {t('allowPdfDownload')}
                    </label>
                    <p className="text-[10px] text-zinc-600">{t('allowPdfDownloadDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setAllowDownload(!allowDownload)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${allowDownload ? 'bg-indigo-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${allowDownload ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Ambience Settings */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Music className="w-3 h-3" />
                    {t('ambience')}
                  </label>
                  <select 
                    value={ambience}
                    onChange={(e) => setAmbience(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-2 text-xs focus:outline-none focus:border-white/20 transition-colors [&>option]:bg-zinc-900 appearance-none cursor-pointer hover:bg-black/30 text-zinc-400"
                  >
                    <option value="">{t('ambienceNone')}</option>
                    <option value="rain">{t('ambienceRain')}</option>
                    <option value="fireplace">{t('ambienceFireplace')}</option>
                    <option value="forest">{t('ambienceForest')}</option>
                    <option value="cafe">{t('ambienceCafe')}</option>
                    <option value="space">{t('ambienceSpace')}</option>
                    <option value="ocean">{t('ambienceOcean')}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'collaborators' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('inviteTeam')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('usernamePlaceholder')}
                    value={collaboratorSearch}
                    onChange={(e) => setCollaboratorSearch(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-600"
                  />
                  <button
                    onClick={handleAddCollaborator}
                    disabled={!bookId}
                    className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {!bookId && <p className="text-[10px] text-amber-500/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">{t('saveBookFirst')}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('members')}</label>
                  <span className="text-xs text-zinc-600">{collaborators.length} {t('activeMembers')}</span>
                </div>
                
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {collab.user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-zinc-200">{collab.user.username}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.userId)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {collaborators.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                      <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">{t('noCollaborators')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AiPanel {...{ apiKey, setApiKey, aiPrompt, setAiPrompt, pageCount, setPageCount, aiMode, setAiMode, isGenerating, handleGenerateAI }} />
            </motion.div>
          )}

          {activeTab === 'characters' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <CharacterSettings bookId={bookId || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
