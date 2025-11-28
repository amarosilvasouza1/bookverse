'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PenTool, Users, Sparkles, ArrowRight, Menu, X, BookOpen, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageClientProps {
  stats: {
    users: number;
    books: number;
    communities: number;
  };
  featuredBooks: {
    id: string;
    title: string;
    coverImage: string | null;
    author: {
      username: string;
    };
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

export default function LandingPageClient({ stats, featuredBooks, session }: LandingPageClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <Link href="/" className="text-xl font-bold tracking-tight">
                BookVerse
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/books" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Browse
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Pricing
              </Link>
              
              {session ? (
                <Link 
                  href="/dashboard" 
                  className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-zinc-400 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0a0a] border-b border-white/10 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <Link 
                  href="/books" 
                  className="block px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link 
                  href="/pricing" 
                  className="block px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                
                {session ? (
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-3 rounded-xl bg-white text-black font-bold text-center mt-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="block px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register" 
                      className="block px-4 py-3 rounded-xl bg-white text-black font-bold text-center mt-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <main className="grow relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 md:pt-52 md:pb-32 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>The future of digital storytelling</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
              <span className="block text-white">Share your story</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                with the world.
              </span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed">
              BookVerse is the premier platform for writers and readers. 
              Create immersive books, build a loyal community, and monetize your passion.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href={session ? "/dashboard/create-book" : "/register"}
                className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                Start Writing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/books" 
                className="group px-8 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center text-white"
              >
                Explore Library
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-white/5 pt-12 max-w-4xl mx-auto"
          >
            {[
              { label: 'Active Readers', value: `${stats.users}+` },
              { label: 'Published Books', value: `${stats.books}+` },
              { label: 'Communities', value: `${stats.communities}+` },
              { label: 'Satisfaction', value: '100%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Featured Books Section */}
        {featuredBooks.length > 0 && (
          <div className="py-24 bg-zinc-900/30 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold">Featured Books</h2>
                <Link href="/books" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredBooks.map((book) => (
                  <Link key={book.id} href={`/books/${book.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-4 relative">
                      {book.coverImage ? (
                        <Image 
                          src={book.coverImage} 
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-zinc-500">by {book.author.username}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="py-32 bg-black relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to succeed</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Powerful tools for creators, immersive experiences for readers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: PenTool,
                  title: "Powerful Editor",
                  desc: "Write with our distraction-free editor. Add images, schedule chapters, and format your masterpiece.",
                  color: "text-purple-400",
                  bg: "bg-purple-500/10"
                },
                {
                  icon: Users,
                  title: "Community First",
                  desc: "Build your tribe. Create exclusive communities where readers can discuss your work and connect.",
                  color: "text-pink-400",
                  bg: "bg-pink-500/10"
                },
                {
                  icon: DollarSign,
                  title: "Monetization",
                  desc: "Earn from your writing. Sell premium books, receive tips, and offer subscriptions to your fans.",
                  color: "text-green-400",
                  bg: "bg-green-500/10"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-900/20 to-black pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to start your journey?</h2>
            <p className="text-xl text-zinc-400 mb-10">
              Join thousands of authors and readers on BookVerse today.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="font-bold text-zinc-400">BookVerse</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-zinc-600">
            &copy; 2024 BookVerse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
