'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackAffiliateClick } from '@/lib/use-affiliate-track';

interface Bookmaker {
  id: number;
  name: string;
  url: string;
  bonus: string;
  featured: boolean;
}

export default function BookmakerStickyBanner() {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('affiliate_bookmakers')
        .select('id, name, url, bonus, featured')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (data) setBookmakers(data);
    }
    load();
  }, []);

  if (bookmakers.length === 0) return null;

  return (
    <div className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-emerald-600"><i className="ri-briefcase-4-line" /></span>
            <h3 className="text-xs font-semibold text-slate-800">Nos partenaires</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {bookmakers.map((b) => (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAffiliateClick(b.name, { sourcePage: window.location.pathname })}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shrink-0">
                  <span className="text-xs font-bold">{b.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{b.name}</p>
                  <p className="text-[11px] text-emerald-600 truncate">{b.bonus || 'Bonus de bienvenue'}</p>
                </div>
                <span className="w-6 h-6 flex items-center justify-center text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0">
                  <i className="ri-arrow-right-up-line text-xs" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {bookmakers.filter(b => b.featured).length > 0 && (
          <div className="rounded-xl overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-4 flex items-center justify-center text-white"><i className="ri-star-fill text-xs" /></span>
              <p className="text-xs font-semibold text-white">Meilleure offre du moment</p>
            </div>
            <p className="text-sm font-bold text-white mb-1">{bookmakers.find(b => b.featured)?.name}</p>
            <p className="text-xs text-emerald-100 mb-3">{bookmakers.find(b => b.featured)?.bonus}</p>
            <a
              href={bookmakers.find(b => b.featured)?.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                const featured = bookmakers.find(b => b.featured);
                if (featured) trackAffiliateClick(featured.name, { sourcePage: window.location.pathname });
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-external-link-line" /></span>
              S&apos;inscrire maintenant
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
