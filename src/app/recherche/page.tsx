'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface MatchItem {
  id: number;
  league: string;
  match_name: string;
  match_date: string;
  prediction: string;
  confidence: number;
  odds: number;
}

const FILTERS = ['Tous', 'Football', 'Basketball', 'Tennis'];

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [results, setResults] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('pronostics').select('*').order('created_at', { ascending: false });
      const loaded = (data as MatchItem[]) || [];
      setMatches(loaded);
      setResults(loaded);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let filtered = matches;

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.match_name.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q) ||
          m.prediction.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'Football') {
      filtered = filtered.filter((m) => ['Ligue 1', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga'].includes(m.league));
    } else if (activeFilter === 'Basketball') {
      filtered = filtered.filter((m) => m.league === 'NBA');
    } else if (activeFilter === 'Tennis') {
      filtered = filtered.filter((m) => m.league === 'Roland Garros');
    }

    setResults(filtered);
  }, [query, activeFilter, matches]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Rechercher un match</h1>
      <p className="text-sm text-slate-500 mb-6">Trouvez des pronostics par équipe, ligue ou compétition</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
            <i className="ri-search-line" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="PSG, NBA, Real Madrid..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
              activeFilter === f
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-4">{results.length} résultat(s)</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-1" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="flex justify-between">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/pronostic/${m.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {m.league}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{m.match_name}</h3>
              <p className="text-xs text-slate-500 mb-4">{m.match_date}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Pronostic</p>
                  <p className="text-sm font-semibold text-slate-900">{m.prediction}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Cote</p>
                  <p className="text-sm font-bold text-indigo-700">{m.odds.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="ri-search-line text-3xl" />
          </div>
          <p className="text-sm text-slate-500">Aucun résultat trouvé pour cette recherche.</p>
        </div>
      )}
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-64 mb-6" />
            <div className="h-10 bg-slate-200 rounded w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
