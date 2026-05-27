'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackAffiliateClick } from '@/lib/use-affiliate-track';

interface Bookmaker {
  id: number;
  name: string;
  url: string;
  bonus: string;
  featured: boolean;
}

export default function BookmakerBanner() {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('affiliate_bookmakers')
        .select('id, name, url, bonus, featured')
        .eq('active', true)
        .eq('featured', true)
        .order('sort_order', { ascending: true })
        .limit(3);
      if (data) setBookmakers(data);
    }
    load();
  }, []);

  if (bookmakers.length === 0) return null;

  return (
    <div className="w-full bg-slate-50 border-t border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center text-emerald-600"><i className="ri-briefcase-4-line" /></span>
            <h3 className="text-sm font-semibold text-slate-800">Nos bookmakers partenaires</h3>
          </div>
          <Link href="/bookmakers" className="text-xs font-medium text-indigo-700 hover:text-indigo-800 transition-colors">
            Voir tous →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bookmakers.map((b) => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick(b.name, { sourcePage: window.location.pathname })}
              className="group flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{b.name}</p>
                <p className="text-xs text-emerald-600 font-medium">{b.bonus || 'Bonus de bienvenue'}</p>
              </div>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="ri-external-link-line" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
