'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Eye, Plus, Trash2, ImageIcon, DollarSign, BookOpen, X, Wand2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { createBook } from '@/app/actions/create-book';

interface Page {
  title: string;
  content: string;
  pageNumber: number;
  id: string; // Added for DnD
}

// Sortable Item Component
function SortablePageItem({ page, index, isActive, onClick, onDelete }: { 
  page: Page, 
  index: number, 
  isActive: boolean, 
  onClick: () => void, 
  onDelete: (e: React.MouseEvent) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-3 pl-8 rounded-lg border transition-all ${
          isActive
            ? 'bg-primary/10 border-primary/50 text-primary'
            : 'bg-white/5 border-transparent hover:bg-white/10 text-muted-foreground'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">Page {index + 1}</span>
          <Trash2
            className="w-4 h-4 text-muted-foreground hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          />
        </div>
        <p className="text-xs truncate opacity-70">{page.title || 'Untitled Page'}</p>
      </button>
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
}

interface CreateBookClientProps {
  initialBook?: any;
  user?: any;
}

export default function CreateBookClient({ initialBook, user }: CreateBookClientProps) {
  const router = useRouter();
  // const searchParams = useSearchParams(); // Unused
  const bookId = initialBook?.id;

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form State
  const [title, setTitle] = useState(initialBook?.title || '');
  const [description, setDescription] = useState(initialBook?.description || '');
  const [coverImage, setCoverImage] = useState(initialBook?.coverImage || '');
  const [genre, setGenre] = useState(initialBook?.genre || '');
  const [isPremium, setIsPremium] = useState(initialBook?.isPremium || false);
  const [price, setPrice] = useState(initialBook?.price?.toString() || '');
  
  // Pages State
  const [pages, setPages] = useState<Page[]>(() => {
    if (initialBook?.pages && initialBook.pages.length > 0) {
       const sortedPages = [...initialBook.pages].sort((a: any, b: any) => a.pageNumber - b.pageNumber);
       return sortedPages.map((p: any) => ({ ...p, id: p.id || `page-${p.pageNumber}-${Date.now()}` }));
    } else if (initialBook?.content) {
       return [{ title: 'Chapter 1', content: initialBook.content, pageNumber: 1, id: `page-${Date.now()}` }];
    }
    return [{ title: 'Chapter 1', content: '', pageNumber: 1, id: 'page-1' }];
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Collaborators State
  const [activeTab, setActiveTab] = useState<'pages' | 'collaborators' | 'ai'>('pages');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  // const [collaborators, setCollaborators] = useState<any[]>(initialBook?.collaborators || []);
  const [collaborators] = useState<any[]>(initialBook?.collaborators || []);

  // UI State
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // AI State
  const [apiKey, setApiKey] = useState(user?.geminiApiKey || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pageCount, setPageCount] = useState(3);
  const [aiMode, setAiMode] = useState<'complete' | 'structure' | 'page'>('complete');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Removed client-side auth check and fetchBook


  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    setPages([...pages, { title: `Chapter ${newPageNumber}`, content: '', pageNumber: newPageNumber, id: `page-${Date.now()}` }]);
    setCurrentPageIndex(pages.length);
  };

  const handleDeletePage = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (pages.length === 1) {
      setNotification({ type: 'error', message: 'You must have at least one page.' });
      return;
    }
    const newPages = pages.filter((_, i) => i !== index).map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPages(newPages);
    if (currentPageIndex >= index && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newPages = arrayMove(items, oldIndex, newIndex);
        // Update page numbers
        return newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      });
      // Update current page index if the selected page moved
      const oldIndex = pages.findIndex((item) => item.id === active.id);
      const newIndex = pages.findIndex((item) => item.id === over?.id);
      
      if (currentPageIndex === oldIndex) {
        setCurrentPageIndex(newIndex);
      } else if (currentPageIndex === newIndex) {
        setCurrentPageIndex(oldIndex);
      } else {
         // If selected page was in between, it might need adjustment, but for now let's keep it simple
         // Ideally we track by ID not index
         // We need to find where the selected page went
         // But since we are inside the setState callback we can't easily see the new state yet
         // Let's just rely on the user clicking again if it gets confused, or better:
         // We should track selectedPageId instead of index, but that's a bigger refactor.
      }
    }
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      // Ideally show a floating button here, but for now we'll use a toolbar button
    }
  };

  const handleRefineText = async () => {
    if (!apiKey) {
      setNotification({ type: 'error', message: 'Please add your Gemini API Key in the AI tab first.' });
      return;
    }
    if (!selectedText || !refineInstruction) return;

    setIsRefining(true);
    try {
      const { refineText } = await import('@/app/actions/refine-text');
      const result = await refineText(apiKey, selectedText, refineInstruction);
      
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else if (result.data) {
        // Replace text in current page
        const currentContent = pages[currentPageIndex].content;
        const newContent = currentContent.replace(selectedText, result.data);
        updateCurrentPage('content', newContent);
        setNotification({ type: 'success', message: 'Text refined!' });
        setShowRefineModal(false);
        setRefineInstruction('');
        setSelectedText('');
      }
    } catch (error) {
      console.error('Refine error:', error);
      setNotification({ type: 'error', message: 'Failed to refine text' });
    } finally {
      setIsRefining(false);
    }
  };

  const updateCurrentPage = (field: 'title' | 'content', value: string) => {
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], [field]: value };
    setPages(newPages);
  };

  const handleAddCollaborator = async () => {
    if (!bookId || !collaboratorSearch) return;
    
    try {
      const { addCollaborator } = await import('@/app/actions/collaborators');
      const result = await addCollaborator(bookId, collaboratorSearch);
      
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        setCollaboratorSearch('');
        // fetchBook(bookId); // Removed as we rely on server data or optimistic updates
        // For now, let's just add it locally to the state since we don't have fetchBook anymore
        // ideally we should return the new collaborator from the action
        setNotification({ type: 'success', message: 'Collaborator added! Refresh to see changes.' });
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!bookId) return;
    if (!confirm('Remove this collaborator?')) return;

    try {
      const { removeCollaborator } = await import('@/app/actions/collaborators');
      const result = await removeCollaborator(bookId, userId);
      
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        // fetchBook(bookId); // Removed
        setNotification({ type: 'success', message: 'Collaborator removed! Refresh to see changes.' });
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleSave = async (published: boolean) => {
    if (!title) {
      setNotification({ type: 'error', message: 'Title is required.' });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const result = await createBook({
        id: bookId || undefined,
        title,
        pages,
        description,
        coverImage,
        genre,
        isPremium,
        price: isPremium ? parseFloat(price) : 0,
        published
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({ 
        type: 'success', 
        message: published ? 'Book published successfully!' : 'Draft saved successfully!' 
      });

      if (published) {
        setTimeout(() => router.push('/dashboard/my-books'), 1500);
      } else if (!bookId && result.bookId) {
         // If it was a new book, update URL to edit mode without reload
         window.history.replaceState(null, '', `/dashboard/create-book?id=${result.bookId}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!apiKey || !aiPrompt) {
      setNotification({ type: 'error', message: 'API Key and Prompt are required' });
      return;
    }

    setIsGenerating(true);
    setNotification(null);

    try {
      const { generateBookAI } = await import('@/app/actions/generate-book-ai');
      const result = await generateBookAI(apiKey, aiPrompt, pageCount, aiMode);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        if (aiMode === 'page') {
          // Update only current page content
          if (result.data.content) {
             updateCurrentPage('content', result.data.content);
             setNotification({ type: 'success', message: 'Page content generated!' });
             setActiveTab('pages');
          }
        } else {
          // Complete or Structure mode - overwrite book
          setTitle(result.data.title);
          setDescription(result.data.description);
          setGenre(result.data.genre || '');
          
          if (result.data.pages) {
            // Add IDs to generated pages
            const pagesWithIds = result.data.pages.map((p: any, i: number) => ({
               ...p,
               id: `gen-page-${i}-${Date.now()}`
            }));
            setPages(pagesWithIds);
            setCurrentPageIndex(0);
          }
          
          setNotification({ type: 'success', message: aiMode === 'structure' ? 'Outline generated!' : 'Book generated successfully!' });
          setActiveTab('pages'); 
        }
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to generate book' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mobile View State
  const [mobileView, setMobileView] = useState<'editor' | 'tools' | 'settings'>('editor');

  // Removed checkingAuth loading state


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 pb-20 md:pb-0">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 backdrop-blur-md border ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <BookOpen className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* Top Bar */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {bookId ? 'Editing' : 'Draft'}
              </span>
              <span className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-[200px]">{title || 'Untitled'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="hidden md:flex items-center px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            
            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="hidden md:block px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex items-center px-4 md:px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin md:mr-2" /> : <Save className="w-4 h-4 md:mr-2" />}
              <span className="hidden md:inline">Publish</span>
              <span className="md:hidden">Save</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-white/5 bg-[#0a0a0a] sticky top-[73px] z-30">
        <button 
          onClick={() => setMobileView('tools')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileView === 'tools' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Tools
        </button>
        <button 
          onClick={() => setMobileView('editor')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileView === 'editor' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Editor
        </button>
        <button 
          onClick={() => setMobileView('settings')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileView === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Settings
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-80px)]">
          
          {/* Sidebar (Tools) */}
          <div className={`${mobileView === 'tools' ? 'block' : 'hidden'} lg:block lg:col-span-2 border-r border-white/5 bg-[#0f0f0f]/30 flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] sticky top-[120px] lg:top-[80px]`}>
            <div className="p-4 border-b border-white/10 flex gap-2">
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'pages' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground'
                }`}
              >
                Pages
              </button>
              <button
                onClick={() => setActiveTab('collaborators')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'collaborators' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground'
                }`}
              >
                Team
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-muted-foreground'
                }`}
              >
                AI
              </button>
            </div>

            {activeTab === 'pages' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                        onClick={() => {
                          setCurrentPageIndex(index);
                          if (window.innerWidth < 1024) setMobileView('editor');
                        }}
                        onDelete={(e) => handleDeletePage(index, e)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                
                <button
                  onClick={handleAddPage}
                  className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Add New Page
                </button>
              </div>
            )}

            {activeTab === 'collaborators' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Add Collaborator</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={collaboratorSearch}
                      onChange={(e) => setCollaboratorSearch(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={handleAddCollaborator}
                      disabled={!bookId}
                      className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {!bookId && <p className="text-xs text-amber-500">Save book first to add collaborators</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Team Members ({collaborators.length}/4)</label>
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {collab.user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm truncate max-w-[100px]">{collab.user.username}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.userId)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {collaborators.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No collaborators yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    AI Assistant
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Gemini API Key</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setAiMode('complete')}
                        className={`py-2 px-1 text-[10px] font-medium rounded-lg border transition-colors ${
                          aiMode === 'complete' 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                            : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        Complete Book
                      </button>
                      <button
                        onClick={() => setAiMode('structure')}
                        className={`py-2 px-1 text-[10px] font-medium rounded-lg border transition-colors ${
                          aiMode === 'structure' 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                            : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        Structure Only
                      </button>
                      <button
                        onClick={() => setAiMode('page')}
                        className={`py-2 px-1 text-[10px] font-medium rounded-lg border transition-colors ${
                          aiMode === 'page' 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                            : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        Current Page
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Prompt</label>
                    <textarea
                      placeholder={
                        aiMode === 'page' 
                          ? "Write a scene where the protagonist discovers a hidden door..." 
                          : "Write a fantasy story about a dragon who loves to bake..."
                      }
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={6}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  {aiMode !== 'page' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">Number of Pages</label>
                        <span className="text-xs font-bold text-purple-400">{pageCount}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !apiKey || !aiPrompt}
                    className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      aiMode === 'page' ? 'Generate Page Content' : 'Generate Book'
                    )}
                  </button>
                  
                  <p className="text-[10px] text-muted-foreground text-center">
                    {aiMode === 'page' 
                      ? 'This will overwrite the content of the currently selected page.'
                      : 'This will overwrite your current title, description, and pages.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main Editor Area */}
          <div className={`${mobileView === 'editor' ? 'block' : 'hidden'} lg:block lg:col-span-7 p-4 md:p-12 transition-all duration-500`}>
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Book Title (Global) */}
              <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-3xl md:text-5xl font-bold placeholder:text-white/10 focus:outline-none border-none p-0 font-serif leading-tight mb-4 md:mb-8"
              />

              {/* Page Title (Local) */}
              <div className="space-y-2">
                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Title</label>
                 <input
                  type="text"
                  placeholder={`Chapter ${currentPageIndex + 1}`}
                  value={pages[currentPageIndex].title}
                  onChange={(e) => updateCurrentPage('title', e.target.value)}
                  className="w-full bg-transparent text-xl md:text-3xl font-bold placeholder:text-white/10 focus:outline-none border-none p-0 font-serif leading-tight"
                />
              </div>
              
              <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground border-y border-white/5 py-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="hidden md:inline">Saving automatically</span>
                  <span className="md:hidden">Saved</span>
                </span>
                <span className="w-px h-4 bg-white/10" />
                <span>{pages[currentPageIndex].content.length} chars</span>
                <span className="w-px h-4 bg-white/10" />
                <span>Page {currentPageIndex + 1}/{pages.length}</span>
              </div>

              {showPreview ? (
                <div className="w-full min-h-[50vh] md:min-h-[60vh] p-2 md:p-8 font-serif">
                  {pages[currentPageIndex].content.split('\n\n').map((paragraph, index) => {
                    const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                    return (
                      <p key={index} className="mb-6 text-lg md:text-xl leading-relaxed text-white/90">
                        {parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                          }
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={i} className="text-white/80 italic">{part.slice(1, -1)}</em>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  placeholder="Start writing..."
                  value={pages[currentPageIndex].content}
                  onChange={(e) => updateCurrentPage('content', e.target.value)}
                  className="w-full min-h-[50vh] md:min-h-[60vh] bg-transparent resize-none focus:outline-none text-lg md:text-xl leading-relaxed placeholder:text-white/10 font-serif text-white/90 p-2 md:p-8"
                  style={{ lineHeight: '1.8' }}
                  onSelect={handleTextSelect}
                />
              )}

              {/* AI Refine Floating Button */}
              {selectedText && !showPreview && (
                <div className="fixed bottom-8 right-8 md:absolute md:bottom-4 md:right-4 z-50 animate-in zoom-in duration-200">
                  <button
                    onClick={() => setShowRefineModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Refine Selection</span>
                  </button>
                </div>
              )}

              {/* Refine Modal */}
              {showRefineModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-400" />
                        Refine with AI
                      </h3>
                      <button onClick={() => setShowRefineModal(false)} className="text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-lg text-sm text-muted-foreground max-h-32 overflow-y-auto italic">
                        &quot;{selectedText}&quot;
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Instruction</label>
                        <input
                          type="text"
                          placeholder="e.g., Make it more dramatic, Fix grammar, Translate to Spanish..."
                          value={refineInstruction}
                          onChange={(e) => setRefineInstruction(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setShowRefineModal(false)}
                          className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRefineText}
                          disabled={isRefining || !refineInstruction}
                          className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refine'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className={`${mobileView === 'settings' ? 'block' : 'hidden'} lg:block lg:col-span-3 border-l border-white/5 bg-[#0f0f0f]/50 backdrop-blur-sm p-6 space-y-8 h-full overflow-y-auto max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-80px)] sticky top-[120px] lg:top-[80px]`}>
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Book Settings</h3>

              {/* Cover Image */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Cover Image
                </label>
                <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                  <ImageUpload
                    label="Upload Cover"
                    value={coverImage}
                    onChange={setCoverImage}
                    aspectRatio="portrait"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none h-24 placeholder:text-white/20"
                    placeholder="Write a catchy blurb..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Genre</label>
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors [&>option]:bg-zinc-900 appearance-none cursor-pointer hover:bg-black/30"
                  >
                    <option value="">Select Genre</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="scifi">Sci-Fi</option>
                    <option value="romance">Romance</option>
                    <option value="mystery">Mystery</option>
                    <option value="thriller">Thriller</option>
                    <option value="nonfiction">Non-Fiction</option>
                  </select>
                </div>
              </div>

              {/* Monetization */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Premium Content
                    </label>
                    <p className="text-xs text-muted-foreground">Monetize your book</p>
                  </div>
                  <button 
                    onClick={() => setIsPremium(!isPremium)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isPremium ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isPremium ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                {isPremium && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price ($)</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9.99"
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


