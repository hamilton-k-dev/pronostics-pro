'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PronosticItem {
  id: number;
  league: string;
  match_name: string;
  match_date: string;
  prediction: string;
  confidence: number;
  odds: number;
  result: string;
}

function getStatusColor(result: string) {
  if (result === 'Gagné') return 'text-emerald-500';
  if (result === 'Perdu') return 'text-rose-500';
  if (result === 'En cours') return 'text-amber-500';
  return 'text-slate-400';
}

export default function FeaturedPronostics() {
  const [pronostics, setPronostics] = useState<PronosticItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('pronostics').select('*').order('created_at', { ascending: false }).limit(6);
      setPronostics((data as PronosticItem[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pronostics du jour</h2>
          <p className="text-sm text-slate-500 mt-1">Sélections analysées par nos experts</p>
        </div>
        <Link
          href="/pronostics"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors"
        >
          Voir tous les pronostics →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-1" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-2 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : pronostics.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">Aucun pronostic disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pronostics.map((p) => (
            <Link
              key={p.id}
              href={`/pronostic/${p.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {p.league}
                </span>
                <span className={`text-xs font-semibold ${getStatusColor(p.result)}`}>{p.result}</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-1">{p.match_name}</h3>
              <p className="text-xs text-slate-500 mb-4">{p.match_date}</p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">Pronostic</p>
                  <p className="text-sm font-semibold text-slate-900">{p.prediction}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Cote</p>
                  <p className="text-sm font-bold text-indigo-700">{p.odds.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Confiance</span>
                  <span className="text-xs font-semibold text-slate-700">{p.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.confidence >= 70
                        ? 'bg-emerald-500'
                        : p.confidence >= 55
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${p.confidence}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
