'use client';

import { useState } from 'react';
import { BookMarked, Check, Plus, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getMyReadingLists, addBookToList, removeBookFromList, createReadingList } from '@/app/actions/reading-lists';
import { useRouter } from 'next/navigation';

interface AddToListButtonProps {
  bookId: string;
  listsContainingBook: string[]; // List IDs that already have this book
  compact?: boolean;
}

interface ReadingListBook {
  bookId: string;
}

interface ReadingList {
  id: string;
  name: string;
  icon?: string | null;
  books: ReadingListBook[];
}

export default function AddToListButton({ bookId, listsContainingBook, compact }: AddToListButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [containingLists, setContainingLists] = useState<Set<string>>(new Set(listsContainingBook));
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadLists = async () => {
    setLoading(true);
    const result = await getMyReadingLists();
    if (result.success && result.lists) {
      setLists(result.lists as unknown as ReadingList[]);
      
      // Update containing lists locally based on fresh data
      const updatedContaining = new Set<string>();
      (result.lists as unknown as ReadingList[]).forEach((list) => {
        if (list.books.some((b) => b.bookId === bookId)) {
          updatedContaining.add(list.id);
        }
      });
      setContainingLists(updatedContaining);
    }
    setLoading(false);
  };

  const handleToggleList = async (listId: string) => {
    const isPresent = containingLists.has(listId);
    
    // Optimistic update
    const newSet = new Set(containingLists);
    if (isPresent) {
      newSet.delete(listId);
    } else {
      newSet.add(listId);
    }
    setContainingLists(newSet);

    try {
      if (isPresent) {
        await removeBookFromList(listId, bookId);
      } else {
        await addBookToList(listId, bookId);
      }
      router.refresh();
    } catch (error) {
      // Revert on error
      setContainingLists(containingLists);
      console.error('Failed to toggle list', error);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createReadingList({ name: newListName });
      if (result.success && result.list) {
        setLists([...lists, { ...result.list, books: [] }]); // Add simple list obj locally
        setNewListName('');
        // Automatically add book to new list
        await handleToggleList(result.list.id);
      }
    } catch (error) {
      console.error('Failed to create list', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (!isOpen && lists.length === 0) loadLists();
        }}
        className={`flex items-center justify-center gap-2 transition-all group ${
          compact 
            ? 'p-2 rounded-lg hover:bg-white/10' 
            : 'px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white'
        }`}
        title={t('addToList') || 'Add to List'}
      >
        <BookMarked className={`w-4 h-4 ${containingLists.size > 0 ? 'text-primary fill-current' : 'text-muted-foreground group-hover:text-white'}`} />
        {!compact && (containingLists.size > 0 ? (t('savedToList') || 'Saved') : (t('addToList') || 'Add to List'))}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div 
            className="bg-[#1a1b1e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 p-4 pb-2 border-b border-white/5">
              <h3 className="font-bold text-sm text-white">{t('saveTo') || 'Save to...'}</h3>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-zinc-500 hover:text-white" /></button>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar mb-3 px-4">
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : (
                lists.map(list => {
                  const isSelected = containingLists.has(list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => handleToggleList(list.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{list.icon || '📋'}</span>
                        <span className={`text-sm ${isSelected ? 'font-bold text-white' : 'text-zinc-400'}`}>{list.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-4 pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('newListName') || 'New list name...'}
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                />
                <button 
                  onClick={handleCreateList} 
                  disabled={!newListName.trim() || isCreating}
                  className="p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
