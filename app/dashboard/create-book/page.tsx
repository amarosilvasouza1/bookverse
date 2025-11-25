'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Eye, Plus, Trash, Trash2, ImageIcon, DollarSign, BookOpen, X, FileText } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { createBook } from '@/app/actions/create-book';

interface Page {
  title: string;
  content: string;
  pageNumber: number;
}

export default function CreateBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [genre, setGenre] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  
  // Pages State
  const [pages, setPages] = useState<Page[]>([{ title: 'Chapter 1', content: '', pageNumber: 1 }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Collaborators State
  const [activeTab, setActiveTab] = useState<'pages' | 'collaborators' | 'ai'>('pages');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);

  // UI State
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // AI State
  const [apiKey, setApiKey] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pageCount, setPageCount] = useState(3);
  const [aiMode, setAiMode] = useState<'complete' | 'structure' | 'page'>('complete');
  const [isGenerating, setIsGenerating] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          window.location.href = '/login';
        } else {
          const data = await response.json();
          if (data.user && data.user.geminiApiKey) {
            setApiKey(data.user.geminiApiKey);
          }
          setCheckingAuth(false);
        }
      } catch (error) {
        window.location.href = '/login';
      }
    }
    checkAuth();
  }, []);

  // Fetch book data if editing
  useEffect(() => {
    if (!bookId) return;
    fetchBook(bookId);
  }, [bookId]);

  const fetchBook = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${id}`);
      if (response.ok) {
        const book = await response.json();
        setTitle(book.title);
        setDescription(book.description || '');
        setCoverImage(book.coverImage || '');
        setGenre(book.genre || '');
        setIsPremium(book.isPremium);
        setPrice(book.price?.toString() || '');
        
        if (book.pages && book.pages.length > 0) {
          setPages(book.pages.sort((a: any, b: any) => a.pageNumber - b.pageNumber));
        } else if (book.content) {
           // Fallback for old single-page books
           setPages([{ title: 'Chapter 1', content: book.content, pageNumber: 1 }]);
        }

        if (book.collaborators) {
          setCollaborators(book.collaborators);
        }
      }
    } catch (error) {
      console.error('Failed to fetch book', error);
    }
  };

  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    setPages([...pages, { title: `Chapter ${newPageNumber}`, content: '', pageNumber: newPageNumber }]);
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
        fetchBook(bookId);
        setNotification({ type: 'success', message: 'Collaborator added!' });
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
        fetchBook(bookId);
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
            setPages(result.data.pages);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black/95 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

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
                {pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPageIndex(index);
                      if (window.innerWidth < 1024) setMobileView('editor');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentPageIndex === index
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'bg-white/5 border-transparent hover:bg-white/10 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Page {index + 1}</span>
                      {pages.length > 1 && (
                        <Trash2
                          className="w-4 h-4 text-muted-foreground hover:text-red-400 cursor-pointer"
                          onClick={(e) => handleDeletePage(index, e)}
                        />
                      )}
                    </div>
                    <p className="text-xs truncate opacity-70">{page.title || 'Untitled Page'}</p>
                  </button>
                ))}
                
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
                />
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
