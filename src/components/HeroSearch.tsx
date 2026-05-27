'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative w-full min-h-[520px] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://readdy.ai/api/search-image?query=A%20modern%20abstract%20geometric%20background%20with%20deep%20indigo%20and%20electric%20blue%20gradients%2C%20subtle%20grid%20lines%20and%20glowing%20particles%2C%20sport%20analytics%20data%20visualization%20aesthetic%2C%20clean%20minimal%20corporate%20style%2C%20soft%20light%20effects%20and%20depth%2C%20perfect%20for%20text%20overlay%20with%20left%20side%20remaining%20relatively%20darker%20and%20uncluttered%20for%20readability&width=1440&height=600&seq=1&orientation=landscape)',
        }}
      />
      <div className="absolute inset-0 bg-indigo-950/50" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Pronostics sportifs
            <br />
            <span className="text-emerald-400">précis et fiables</span>
          </h1>
          <p className="text-lg text-slate-200 mb-8 leading-relaxed">
            Découvrez des analyses expertes, des scores en direct et une communauté de plus de 50 000 parieurs passionnés.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                <i className="ri-search-line" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un match, une équipe..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {['PSG vs Marseille', 'Real Madrid vs Barça', 'NBA Playoffs', 'Roland Garros'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/recherche?q=${encodeURIComponent(tag)}`)}
                className="px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 text-white rounded-full transition-colors border border-white/20"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
