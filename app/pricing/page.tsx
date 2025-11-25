import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Unlock Infinite Worlds</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your reading habits. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-8 rounded-2xl flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Explorer</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            <p className="text-muted-foreground mb-8">Perfect for casual readers testing the waters.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Access to free books</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Weekly free rotation (1 book)</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Join public communities</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-bold">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="glass-card p-8 rounded-2xl flex flex-col relative border-primary/50 bg-primary/5">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary">Adventurer</h3>
            <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            <p className="text-muted-foreground mb-8">For avid readers who want more.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-3" />
                <span>Unlimited access to all books</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-3" />
                <span>Offline reading</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-3" />
                <span>Create your own community</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-3" />
                <span>Ad-free experience</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors font-bold shadow-lg shadow-primary/25">
              Subscribe Now
            </button>
          </div>

          {/* Author Plan */}
          <div className="glass-card p-8 rounded-2xl flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Creator</h3>
            <div className="text-4xl font-bold mb-6">$19.99<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            <p className="text-muted-foreground mb-8">Tools to build your empire.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Everything in Adventurer</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span>Keep 90% of book sales</span>
              </li>
            </ul>

            <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-bold">
              Become a Creator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
