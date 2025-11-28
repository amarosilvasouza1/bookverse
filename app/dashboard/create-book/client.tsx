'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, X, Menu } from 'lucide-react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Link from 'next/link';
import { createBook } from '@/app/actions/create-book';
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
}

interface CreateBookClientProps {
  initialBook?: Book;
  user?: User;
}

export default function CreateBookClient({ initialBook, user }: CreateBookClientProps) {
  const router = useRouter();
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
  const [activeTab, setActiveTab] = useState<'pages' | 'collaborators' | 'ai' | 'characters' | 'settings'>('pages');
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
        setTimeout(() => router.push('/dashboard/my-books'), 1500);
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
    if (!apiKey) {
      setNotification({ type: 'error', message: 'API Key is required' });
      return;
    }

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

  return (
    <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-60 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 backdrop-blur-md border ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <BookOpen className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      {/* Top Bar (Mobile Only or Minimal) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-sm truncate max-w-[150px]">{title || 'Untitled'}</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div className={`
          absolute md:relative z-40 h-full w-[280px] md:w-[320px] bg-[#0a0a0a] md:bg-transparent transition-transform duration-300 border-r border-white/5
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isFocusMode ? 'md:-translate-x-full md:w-0 md:border-none' : ''}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <button 
                onClick={() => {
                  if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Book Editor</h1>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                  {bookId ? 'Editing Mode' : 'Draft Mode'}
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <EditorSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
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
        <div className="flex-1 h-full relative bg-[#0a0a0a] md:bg-linear-to-br md:from-[#0a0a0a] md:to-[#111]">
          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div className="h-full p-2 sm:p-4 md:p-8 max-w-6xl mx-auto">
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
