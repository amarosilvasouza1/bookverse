import { ArrowLeft, Search, Filter, Star } from 'lucide-react';
import Link from 'next/link';

export default function BooksPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search books..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all w-64"
              />
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekly Free Rotation */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <h2 className="text-3xl font-bold">Weekly Free Rotation</h2>
          </div>
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="w-48 h-72 bg-gray-800 rounded-lg shadow-2xl shrink-0 mx-auto md:mx-0">
                {/* Book Cover Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-linear-to-br from-gray-700 to-gray-900 rounded-lg">
                  Cover
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold mb-4">
                  Free for 5 days
                </div>
                <h3 className="text-4xl font-bold mb-2">The Last Starship</h3>
                <p className="text-xl text-muted-foreground mb-6">by Elena Void</p>
                <p className="text-gray-300 mb-8 max-w-2xl leading-relaxed">
                  In a galaxy where stars are dying, one pilot discovers a secret that could save them all. 
                  Join Captain Nova on a perilous journey through the void, facing ancient cosmic horrors and political intrigue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/25">
                    Read Now for Free
                  </button>
                  <button className="glass-card hover:bg-white/10 px-8 py-3 rounded-full font-bold transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Books Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-2/3 bg-gray-800 rounded-lg mb-3 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Read
                    </span>
                  </div>
                </div>
                <h3 className="font-bold truncate group-hover:text-primary transition-colors">Book Title {i}</h3>
                <p className="text-sm text-muted-foreground">Author Name</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
