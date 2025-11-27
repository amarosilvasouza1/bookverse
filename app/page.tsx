'use client';

import Link from 'next/link';
import { PenTool, Users, Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-card border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gradient">
                BookVerse
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/books" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Browse
                </Link>
                <Link href="/pricing" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-white/10 absolute w-full animate-in slide-in-from-top-5 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/books" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/login" 
                className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium mt-4 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="grow">
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              <span className="block">Discover & Create</span>
              <span className="block text-gradient">Digital Worlds</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
              The premier platform for digital book creators and readers. 
              Write your story, build your community, and earn from your passion.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                Start Reading Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/register?role=author" className="glass-card px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
                Become an Author
              </Link>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Powerful Creation Tools</h3>
                <p className="text-muted-foreground">
                  Write, edit, and format your books with our advanced editor. Upload covers and manage your library with ease.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 text-pink-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vibrant Communities</h3>
                <p className="text-muted-foreground">
                  Build a fanbase. Create exclusive communities for your readers to discuss your books and interact with you.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Weekly Free Rotation</h3>
                <p className="text-muted-foreground">
                  Discover new authors every week with our curated selection of free premium books available for a limited time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 BookVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
