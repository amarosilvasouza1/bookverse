'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function GlobalSearchInput({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative group ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder={t('search') || 'Search...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all font-medium"
      />
    </form>
  );
}
