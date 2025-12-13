'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Trash2, X, Loader2, BookMarked } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  getMyReadingLists, 
  createReadingList, 
  deleteReadingList, 
  removeBookFromList
} from '@/app/actions/reading-lists';
import { useLanguage } from '@/context/LanguageContext';

interface ReadingListBook {
  id: string;
  book: {
    id: string;
    title: string;
    coverImage: string | null;
    author: { username: string; name: string | null };
  };
  addedAt: Date | string;
}

interface ReadingList {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  books: ReadingListBook[];
  _count: { books: number };
}

export default function ReadingListsClient() {
  const { t } = useLanguage();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('📋');
  const [newListColor, setNewListColor] = useState('#8b5cf6');
  const [creating, setCreating] = useState(false);

  const loadLists = useCallback(async () => {
    setLoading(true);
    const result = await getMyReadingLists();
    if (result.success && result.lists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLists(result.lists as any);
      if (result.lists.length > 0 && !selectedList) {
        setSelectedList(result.lists[0].id);
      }
    }
    setLoading(false);
  }, [selectedList]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    const result = await createReadingList({ 
      name: newListName, 
      icon: newListIcon, 
      color: newListColor 
    });
    if (result.success) {
      setNewListName('');
      setShowCreateModal(false);
      loadLists();
    }
    setCreating(false);
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm(t('deleteListConfirm') || 'Are you sure you want to delete this list?')) return;
    await deleteReadingList(listId);
    loadLists();
  };

  const handleRemoveBook = async (listId: string, bookId: string) => {
    await removeBookFromList(listId, bookId);
    loadLists();
  };

  const selectedListData = lists.find(l => l.id === selectedList);

  const iconOptions = ['📋', '📚', '❤️', '⭐', '🔥', '💎', '🎯', '📖', '🌟', '💡'];
  const colorOptions = ['#8b5cf6', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('readingLists') || 'Reading Lists'}</h1>
          <p className="text-muted-foreground mt-1">{t('organizeYourBooks') || 'Organize your books into custom lists'}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('newList') || 'New List'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar - Lists */}
        <div className="space-y-2">
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => setSelectedList(list.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                selectedList === list.id
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${list.color}20` }}
                >
                  {list.icon || '📋'}
                </span>
                <div className="text-left">
                  <p className="font-medium text-white">{list.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {list._count.books} {list._count.books === 1 ? 'book' : 'books'}
                  </p>
                </div>
              </div>
              {!list.isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </button>
          ))}

          {lists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('noListsYet') || 'No lists yet'}</p>
            </div>
          )}
        </div>

        {/* Main Content - Books in List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px]">
          {selectedListData ? (
            <>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <span 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedListData.color}20` }}
                >
                  {selectedListData.icon}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedListData.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedListData._count.books} {selectedListData._count.books === 1 ? 'book' : 'books'}
                  </p>
                </div>
              </div>

              {selectedListData.books.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedListData.books.map(item => (
                    <div key={item.id} className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
                      <Link href={`/dashboard/books/${item.book.id}`}>
                        <div className="aspect-3/4 relative">
                          {item.book.coverImage ? (
                            <Image
                              src={item.book.coverImage}
                              alt={item.book.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-white truncate">{item.book.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.book.author.name || item.book.author.username}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveBook(selectedListData.id, item.book.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">{t('emptyList') || 'This list is empty'}</p>
                  <p className="text-sm">{t('addBooksToList') || 'Add books from the browse page'}</p>
                  <Link
                    href="/dashboard/browse"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('browseBooks') || 'Browse Books'}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('selectAList') || 'Select a list to view books'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-white mb-4">{t('createNewList') || 'Create New List'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('listName') || 'List Name'}</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder={t('enterListName') || 'Enter list name...'}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t('icon') || 'Icon'}</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewListIcon(icon)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        newListIcon === icon ? 'bg-white/20 ring-2 ring-primary' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t('color') || 'Color'}</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewListColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newListColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-white transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleCreateList}
                disabled={creating || !newListName.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : (t('create') || 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
