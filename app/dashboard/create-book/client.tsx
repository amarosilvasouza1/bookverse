'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, X, Menu } from 'lucide-react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Link from 'next/link';
import { createBook } from '@/app/actions/create-book';
import { useLanguage } from '@/context/LanguageContext';
import EditorSidebar from './components/EditorSidebar';
import EditorMain from './components/EditorMain';

interface Page {
  title: string;
  content: string;
  pageNumber: number;
  id: string;
  scheduledAt?: string;
}

interface User {
  id: string;
  username: string;
  geminiApiKey?: string;
}

interface Collaborator {
  id: string;
  userId: string;
  user: User;
}

interface Book {
  id?: string;
  title: string;
  description?: string;
  coverImage?: string;
  genre?: string;
  isPremium: boolean;
  allowDownload?: boolean;
  ambience?: string;
  price?: number | string;
  pages?: Page[];
  content?: string;
  collaborators?: Collaborator[];
  tags?: string;
}

interface CreateBookClientProps {
  initialBook?: Book;
  user?: User;
}

export default function CreateBookClient({ initialBook, user }: CreateBookClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const bookId = initialBook?.id;

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState(initialBook?.title || '');
  const [description, setDescription] = useState(initialBook?.description || '');
  const [coverImage, setCoverImage] = useState(initialBook?.coverImage || '');
  const [genre, setGenre] = useState(initialBook?.genre || '');
  const [tags, setTags] = useState(initialBook?.tags || ''); // Added tags state
  const [isPremium, setIsPremium] = useState(initialBook?.isPremium || false);
  const [allowDownload, setAllowDownload] = useState(initialBook?.allowDownload || false);
  const [ambience, setAmbience] = useState(initialBook?.ambience || '');
  const [price, setPrice] = useState(initialBook?.price?.toString() || '');
  
  // Pages State
  const [pages, setPages] = useState<Page[]>(() => {
    if (initialBook?.pages && initialBook.pages.length > 0) {
       const sortedPages = [...initialBook.pages].sort((a, b) => a.pageNumber - b.pageNumber);
       return sortedPages.map((p) => ({ ...p, id: p.id || `page-${p.pageNumber}-${Date.now()}` }));
    } else if (initialBook?.content) {
       return [{ title: 'Chapter 1', content: initialBook.content, pageNumber: 1, id: `page-${Date.now()}` }];
    }
    return [{ title: 'Chapter 1', content: '', pageNumber: 1, id: 'page-1' }];
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Collaborators State
  const [activeTab, setActiveTab] = useState<'pages' | 'collaborators' | 'ai' | 'characters' | 'settings' | 'brainstorm'>('pages');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaborators] = useState<Collaborator[]>(initialBook?.collaborators || []);

  // UI State
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // AI State
  const [apiKey, setApiKey] = useState(user?.geminiApiKey || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pageCount, setPageCount] = useState(3);
  const [aiMode, setAiMode] = useState<'complete' | 'structure' | 'page' | 'analyze'>('complete');
  const [isGenerating, setIsGenerating] = useState(false);

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
        return newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      });
      
      const oldIndex = pages.findIndex((item) => item.id === active.id);
      const newIndex = pages.findIndex((item) => item.id === over?.id);
      
      if (currentPageIndex === oldIndex) {
        setCurrentPageIndex(newIndex);
      } else if (pages[currentPageIndex].id === active.id) {
         // If the current page was moved, update index to follow it
         setCurrentPageIndex(newIndex);
      }
    }
  };



  const updateCurrentPage = (field: 'title' | 'content', value: string) => {
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], [field]: value };
    setPages(newPages);
  };

  const handleSchedulePage = (index: number, date: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], scheduledAt: date };
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
        tags, // Added tags here
        isPremium,
        allowDownload,
        ambience,
        price: isPremium ? parseFloat(price) : 0,
        published
      });

      if (result.error) throw new Error(result.error);

      setNotification({ 
        type: 'success', 
        message: published ? 'Book published successfully!' : 'Draft saved successfully!' 
      });

      if (published) {
        setTimeout(() => router.push('/dashboard/books'), 1500);
      } else if (!bookId && result.bookId) {
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
    // We allow empty apiKey now as it falls back to server env var
    // if (!apiKey) {
    //   setNotification({ type: 'error', message: 'API Key is required' });
    //   return;
    // }

    if (aiMode !== 'analyze' && !aiPrompt) {
      setNotification({ type: 'error', message: 'Prompt is required' });
      return;
    }

    setIsGenerating(true);
    setNotification(null);

    try {
      const { generateBookAI } = await import('@/app/actions/generate-book-ai');
      
      // For analysis, we send the current page content as the prompt
      const promptToSend = aiMode === 'analyze' 
        ? `Analyze this text and provide 3 specific improvements for pacing, tone, and clarity:\n\n${pages[currentPageIndex].content}`
        : aiPrompt;

      const result = await generateBookAI(apiKey, promptToSend, pageCount, aiMode);

      if (result.error) throw new Error(result.error);

      if (result.data) {
        if (aiMode === 'analyze') {
           // Show analysis result in a modal or notification (for now, using notification)
           // ideally we would show this in a dedicated UI panel
           setNotification({ type: 'success', message: 'Analysis complete! Check the AI panel for results.' });
           setAiPrompt(result.data.analysis || ''); // Store analysis in prompt area for now
        } else if (aiMode === 'page') {
          if (result.data.content) {
             updateCurrentPage('content', result.data.content);
             setNotification({ type: 'success', message: 'Page content generated!' });
             setActiveTab('pages');
          }
        } else {
          setTitle(result.data.title);
          setDescription(result.data.description);
          setGenre(result.data.genre || '');
          
          if (result.data.pages) {
            const pagesWithIds = result.data.pages.map((p: Page, i: number) => ({
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

  const handleBrainstorm = async (prompt: string) => {
    // We allow empty apiKey now as it falls back to server env var
    // if (!apiKey) {
    //   setNotification({ type: 'error', message: 'API Key is required' });
    //   return null;
    // }

    try {
      const { generateBookAI } = await import('@/app/actions/generate-book-ai');
      const result = await generateBookAI(apiKey, prompt, 0, 'brainstorm'); // 0 pages for brainstorm
      
      if (result.error) throw new Error(result.error);
      
      return result.data;
    } catch (error) {
      console.error('Brainstorm Error:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to brainstorm' 
      });
      return null;
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambience - Subtle Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-60 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 backdrop-blur-xl border border-white/5 ${
          notification.type === 'success' 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {notification.type === 'success' ? <BookOpen className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      {/* Mobile Header - Glassmorphic */}
      <div className="md:hidden relative z-50 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-sm truncate max-w-[150px] text-zinc-200">{title || t('untitled')}</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className={`p-2 rounded-full transition-colors ${mobileMenuOpen ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <div className={`
          absolute md:relative z-40 h-full w-[280px] md:w-[80px] lg:w-[300px] bg-[#050505]/95 md:bg-transparent transition-all duration-300 ease-[bezier(0.25,0.1,0.25,1)]
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full md:translate-x-0'}
          ${isFocusMode ? 'md:-translate-x-full md:w-0 md:opacity-0' : ''}
          border-r border-white/5 backdrop-blur-xl md:backdrop-blur-none
        `}>
          <div className="h-full flex flex-col">
            <div className="hidden md:flex p-4 lg:p-6 border-b border-white/5 items-center gap-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-zinc-500 hover:text-white group"
                title={t('backToDashboard')}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-sm font-bold text-white leading-none tracking-tight">{t('bookEditor')}</h1>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-medium">
                  {bookId ? t('editingMode') : t('draftMode')}
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <EditorSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleBrainstorm={handleBrainstorm}
                pages={pages}
                currentPageIndex={currentPageIndex}
                setCurrentPageIndex={setCurrentPageIndex}
                handleAddPage={handleAddPage}
                handleDeletePage={handleDeletePage}
                handleSchedulePage={handleSchedulePage}
                handleDragEnd={handleDragEnd}
                collaborators={collaborators}
                collaboratorSearch={collaboratorSearch}
                setCollaboratorSearch={setCollaboratorSearch}
                handleAddCollaborator={handleAddCollaborator}
                handleRemoveCollaborator={handleRemoveCollaborator}
                bookId={bookId}
                apiKey={apiKey}
                setApiKey={setApiKey}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                pageCount={pageCount}
                setPageCount={setPageCount}
                aiMode={aiMode}
                setAiMode={setAiMode}
                isGenerating={isGenerating}
                handleGenerateAI={handleGenerateAI}
                coverImage={coverImage}
                setCoverImage={setCoverImage}
                description={description}
                setDescription={setDescription}
                genre={genre}
                setGenre={setGenre}
                tags={tags}
                setTags={setTags}
                isPremium={isPremium}
                setIsPremium={setIsPremium}
                price={price}
                setPrice={setPrice}
                allowDownload={allowDownload}
                setAllowDownload={setAllowDownload}
                ambience={ambience}
                setAmbience={setAmbience}
              />
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 h-full relative">
          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div className="h-full w-full">
            <EditorMain
              title={title}
              setTitle={setTitle}
              pages={pages}
              currentPageIndex={currentPageIndex}
              updateCurrentPage={updateCurrentPage}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              handleSave={handleSave}
              loading={loading}
              bookId={bookId}
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
