'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        alert(data.error || t('loginFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-in fade-in zoom-in duration-500">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('loginWelcomeBack')}</h1>
          <p className="text-muted-foreground">{t('signInToContinue')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">{t('emailLabel')}</label>
            <input 
              id="email"
              name="email"
              type="email" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">{t('passwordLabel')}</label>
            <input 
              id="password"
              name="password"
              type="password" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('signingInButton') : t('signInButton')}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 backdrop-blur-md px-2 text-muted-foreground rounded-full">
                {t('orContinueWith') || 'Ou entrar com'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/google'}
            className="w-full bg-white text-black font-bold py-3 rounded-lg transition-all hover:bg-white/90 flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t('dontHaveAccount')}{' '}
          <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
            {t('signUpLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
