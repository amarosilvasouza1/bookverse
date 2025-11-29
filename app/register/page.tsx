'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        const data = await response.json();
        alert(data.error || t('registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 rounded-2xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('createAccount')}</h1>
          <p className="text-muted-foreground">{t('joinCommunitySubtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="username">{t('usernameLabel')}</label>
            <input 
              id="username"
              name="username"
              type="text" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder={t('usernamePlaceholder')}
              required
              pattern="^[a-zA-Z0-9._]+$"
              title={t('usernamePatternError')}
              onChange={(e) => {
                const val = e.target.value;
                if (!/^[a-zA-Z0-9._]*$/.test(val)) {
                  e.target.setCustomValidity(t('usernamePatternError'));
                } else {
                  e.target.setCustomValidity('');
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('usernameHelper')}</p>
          </div>
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
            {isLoading ? t('creatingAccountButton') : t('signUpButton')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
            {t('signInLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
