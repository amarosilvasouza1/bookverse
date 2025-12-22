'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PenTool, Users, Sparkles, ArrowRight, Menu, X, BookOpen, DollarSign, ChevronRight, Star, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

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
      name: string | null;
      username: string;
    };
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

export default function LandingPageClient({ stats, featuredBooks, session }: LandingPageClientProps) {
  const { t } = useLanguage();
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
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* Navigation - Glassmorphic */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled || isMobileMenuOpen ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-black/40' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow duration-300">
                <BookOpen className="w-6 h-6 text-white absolute z-10" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <Link href="/" className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/70 group-hover:to-white transition-all">
                {t('bookVerse')}
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/books" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
                {t('browse')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
                {t('pricing')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300" />
              </Link>
              
              {session ? (
                <Link 
                  href="/dashboard" 
                  className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5 hover:shadow-white/20"
                >
                  {t('dashboard')}
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-bold text-white hover:text-purple-300 transition-colors">
                    {t('signIn')}
                  </Link>
                  <Link 
                    href="/register" 
                    className="group relative px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <span className="relative z-10 group-hover:text-black transition-colors">{t('getStarted')}</span>
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-20 left-0 w-full bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden z-40"
            >
              <div className="px-6 py-8 space-y-4 flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                <Link 
                  href="/books" 
                  className="text-2xl font-bold text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('browseLibrary')}
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-2xl font-bold text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('pricingPlans')}
                </Link>
                
                <div className="w-16 h-1 bg-white/10 rounded-full my-6" />

                {session ? (
                  <Link 
                    href="/dashboard" 
                    className="w-full max-w-xs bg-white text-black py-4 rounded-2xl text-lg font-bold text-center hover:bg-zinc-200 transition-transform active:scale-95"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('goToDashboard')}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Link 
                      href="/login" 
                      className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold text-center hover:bg-white/5 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('signIn')}
                    </Link>
                    <Link 
                      href="/register" 
                      className="w-full bg-white text-black py-4 rounded-2xl font-bold text-center hover:bg-zinc-200 transition-transform active:scale-95 shadow-xl shadow-purple-500/20"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('createAccount')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Immersive */}
      <main className="grow relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[15000ms]" />
          <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-pink-500/10 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-24 md:pt-64 md:pb-40 flex flex-col items-center text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="w-full"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 mb-8 backdrop-blur-md shadow-lg shadow-purple-900/20 hover:bg-white/10 transition-colors cursor-default"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{t('reimagingStorytelling')}</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter mb-8 leading-[1.1] md:leading-[1.05]">
              <span className="block text-white drop-shadow-2xl">{t('shareYourStory')}</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x pb-4">
                {t('withTheWorld')}
              </span>
            </h1>
            
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-2xl text-zinc-400 mb-12 leading-relaxed font-light">
               {t('landingSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-5 w-full max-w-md sm:max-w-none mx-auto">
              <Link 
                href={session ? "/dashboard/create-book" : "/register"}
                className="group relative bg-white text-black px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
              >
                <span>{t('startWritingHero') || 'Start Writing'}</span>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link 
                href="/books" 
                className="group px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md flex items-center justify-center gap-2 text-white"
              >
                {t('exploreLibrary')}
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full max-w-5xl mx-auto mt-24 md:mt-32 p-1 rounded-3xl bg-linear-to-b from-white/10 to-transparent"
          >
            <div className="bg-black/40 backdrop-blur-md rounded-[22px] border border-white/5 p-8 md:p-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
                {[
                  { label: 'Active Readers', value: stats.users, suffix: '+' },
                  { label: 'Published Books', value: stats.books, suffix: '+' },
                  { label: 'Communities', value: stats.communities, suffix: '+' },
                  { label: 'Creator Earnings', value: '$10k', suffix: '+' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start group">
                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Books Section - Carousel Style */}
        {featuredBooks.length > 0 && (
          <div className="py-24 md:py-32 relative">
             <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">{t('trendingThisWeek')}</h2>
            <p className="text-zinc-400 text-lg">{t('trendingSubtitle')}</p>
          </div>
          <Link href="/books" className="hidden md:flex items-center gap-2 text-white hover:text-purple-400 transition-colors font-bold group">
            {t('viewFullLibrary')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredBooks.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <Link href={`/books/${book.id}`} className="block h-full">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-5 bg-zinc-800 shadow-2xl ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-500">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center p-6 text-zinc-600">
                             <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                             <span className="text-xs font-medium uppercase tracking-widest">{t('noCover')}</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                          <span className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg flex items-center gap-2">
                             <BookOpen className="w-4 h-4" />
                             Read
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1 leading-tight">
                          {book.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-white/5">
                            {(book.author.name || book.author.username || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span>{book.author.name || book.author.username}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Grid - Bento Box Style */}
        <div id="features" className="py-32 relative overflow-hidden bg-black">
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
          <span className="text-purple-500 font-bold tracking-wider text-sm uppercase mb-4 block">{t('whyBookVerse')}</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">{t('everythingYouNeed')}</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t('everythingSubtitle')}
          </p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: PenTool,
                  title: t('featureEditorTitle'),
                  desc: t('featureEditorDesc'),
                  gradient: "from-blue-500/20 to-purple-500/20",
                  border: "group-hover:border-blue-500/30",
                  iconColor: "text-blue-400"
                },
                {
                  icon: Users,
                  title: t('featureCommunityTitle'),
                  desc: t('featureCommunityDesc'),
                  gradient: "from-purple-500/20 to-pink-500/20",
                  border: "group-hover:border-purple-500/30",
                  iconColor: "text-purple-400"
                },
                {
                  icon: DollarSign,
                  title: t('featureMonetizationTitle'),
                  desc: t('featureMonetizationDesc'),
                  gradient: "from-green-500/20 to-emerald-500/20",
                  border: "group-hover:border-emerald-500/30",
                  iconColor: "text-emerald-400"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`group relative p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 ${feature.border} transition-all duration-300 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-zinc-400 leading-relaxed text-lg group-hover:text-zinc-300 transition-colors">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section - Big Impact */}
        <div className="relative py-32 md:py-48 overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-b from-black via-purple-900/20 to-black" />
           
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative z-10">
          <div className="inline-flex p-4 bg-white/10 rounded-full mb-8 backdrop-blur-md animate-bounce">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            {t('readyToStart')}
          </h2>
          <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('joinThousands')}
          </p>
          <Link 
            href="/register" 
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
          >
            {t('createFreeAccount')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-xl font-bold text-white">{t('bookVerse')}</span>
              </div>
              <p className="text-zinc-500 max-w-sm mb-8">
                {t('footerDesc')}
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
                    <div className="w-4 h-4 bg-zinc-500 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">{t('platform')}</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><Link href="/books" className="hover:text-purple-400 transition-colors">{t('browse')}</Link></li>
                <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">{t('pricing')}</Link></li>
                <li><Link href="#features" className="hover:text-purple-400 transition-colors">{t('features')}</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">{t('showcase')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">{t('company')}</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><Link href="/about" className="hover:text-purple-400 transition-colors">{t('aboutUs')}</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">{t('careers')}</Link></li>
                <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">{t('privacyPolicy')}</Link></li>
                <li><Link href="/terms" className="hover:text-purple-400 transition-colors">{t('termsOfService')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-600">
              {t('rightsReserved')}
            </p>
            <div className="flex gap-8 text-sm text-zinc-600">
              <Link href="/terms" className="hover:text-zinc-400 transition-colors">{t('termsOfService')}</Link>
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors">{t('privacyPolicy')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
