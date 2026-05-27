'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackAffiliateClick } from '@/lib/use-affiliate-track';

interface Bookmaker {
  id: number;
  name: string;
  url: string;
  bonus: string;
  description: string;
  logo_url?: string;
  featured: boolean;
}

export default function BookmakersPage() {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('affiliate_bookmakers')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (data) {
        setBookmakers(data);
        setFeaturedCount(data.filter((b: Bookmaker) => b.featured).length);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Bookmakers partenaires</h1>
        <p className="text-sm text-slate-500">
          {bookmakers.length} bookmakers recommandés — {featuredCount} partenaires officiels avec bonus exclusifs
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 mx-auto mb-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Chargement des partenaires...</p>
        </div>
      ) : bookmakers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300"><i className="ri-briefcase-4-line text-2xl" /></span>
          <p className="text-sm text-slate-500">Aucun bookmaker partenaire pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookmakers.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                b.featured ? 'border-emerald-300' : 'border-slate-200'
              }`}
            >
              {b.featured && (
                <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-emerald-600"><i className="ri-star-fill text-xs" /></span>
                  <span className="text-xs font-semibold text-emerald-700">Partenaire officiel</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  {b.featured && (
                    <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-full">
                      {b.bonus}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">{b.description || 'Bookmaker partenaire recommandé par nos experts.'}</p>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAffiliateClick(b.name, { sourcePage: '/bookmakers' })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center"><i className="ri-external-link-line" /></span>
                  {b.featured ? `Parier sur ${b.name}` : 'Visiter'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-4 h-4 flex items-center justify-center text-amber-500"><i className="ri-error-warning-line" /></span>
          Avertissement
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Les liens présents sur cette page sont des liens d&apos;affiliation. En cliquant, vous serez redirigé vers le site du bookmaker. Les paris sportifs comportent des risques de perte en capital. Jouez de manière responsable. Si vous pensez être en difficulté avec les jeux d&apos;argent, appelez le 09 74 75 13 13 (appel non surtaxé).
        </p>
      </div>
    </div>
  );
}
