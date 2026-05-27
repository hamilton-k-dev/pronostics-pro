'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { trackAffiliateClick } from '@/lib/use-affiliate-track';

interface OddsEntry {
  bookmaker: string;
  odds: number;
  url: string;
}

interface AffiliateBookmaker {
  id: number;
  name: string;
  url: string;
  bonus: string | null;
  active: boolean;
}

export default function OddsComparison({
  pronosticId,
  oddsData,
  matchName,
}: {
  pronosticId: number;
  oddsData: OddsEntry[] | null;
  matchName: string;
}) {
  const [bookmakers, setBookmakers] = useState<AffiliateBookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [stake, setStake] = useState(10);

  useEffect(() => {
    async function loadBookmakers() {
      const { data } = await supabase
        .from('affiliate_bookmakers')
        .select('id, name, url, bonus, active')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (data) setBookmakers(data as AffiliateBookmaker[]);
      setLoading(false);
    }
    loadBookmakers();
  }, []);

  const safeOddsData = oddsData || [];

  const rows = bookmakers.map((bm) => {
    const match = safeOddsData.find((o) => o.bookmaker === bm.name);
    return {
      ...bm,
      odds: match?.odds || null,
      url: match?.url || bm.url,
    };
  }).sort((a, b) => {
    if (a.odds && b.odds) return b.odds - a.odds;
    if (a.odds) return -1;
    if (b.odds) return 1;
    return 0;
  });

  const bestOdds = rows.filter((r) => r.odds);
  const best = bestOdds.length > 0 ? bestOdds[0] : null;
  const bestGain = best && best.odds ? stake * best.odds : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-bar-chart-box-line" /></span>
          <h2 className="text-sm font-semibold text-slate-900">Comparateur de cotes</h2>
        </div>
        <div className="px-5 py-6 text-center text-sm text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-bar-chart-box-line" /></span>
        <h2 className="text-sm font-semibold text-slate-900">Comparateur de cotes</h2>
        {best && (
          <span className="ml-auto text-xs font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
            Meilleure cote {best.odds?.toFixed(2)} chez {best.name}
          </span>
        )}
      </div>

      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Votre mise (€)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={500}
                step={1}
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-700"
              />
              <input
                type="number"
                min={1}
                max={5000}
                step={1}
                value={stake}
                onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 0))}
                className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {bestGain > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">Gain max. estimé</p>
              <p className="text-xl font-bold text-emerald-700">{bestGain.toFixed(2)} €</p>
              <p className="text-[10px] text-slate-400">+{(bestGain - stake).toFixed(2)} € net chez {best?.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Bookmaker</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Cote</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Différence</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Gain potentiel</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Bonus</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isBest = best && row.id === best.id;
              const diff = best && row.odds && best.odds
                ? ((row.odds - best.odds) / best.odds * 100).toFixed(1)
                : null;
              const gain = row.odds ? (stake * row.odds).toFixed(2) : null;
              const netGain = row.odds ? (stake * row.odds - stake).toFixed(2) : null;

              return (
                <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${isBest ? 'bg-emerald-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isBest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                        {isBest && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Meilleure cote</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.odds ? (
                      <span className={`text-base font-bold ${isBest ? 'text-emerald-700' : 'text-indigo-700'}`}>
                        {row.odds.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Non renseignée</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {diff !== null ? (
                      <span className={`text-xs font-medium ${Number(diff) === 0 ? 'text-emerald-600' : Number(diff) < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {Number(diff) === 0 ? 'Référence' : `${diff}%`}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {gain !== null ? (
                      <div>
                        <span className={`text-sm font-bold ${isBest ? 'text-emerald-700' : 'text-slate-900'}`}>{gain} €</span>
                        <span className="text-[10px] text-slate-400 ml-1">(+{netGain} €)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">
                    {row.bonus || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={row.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackAffiliateClick(row.name, {
                          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/pronostic',
                          pronosticId,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        isBest
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      Parier
                      <span className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-external-link-line" /></span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Cotes affichées à titre indicatif. Les cotes sont susceptibles de changer. Pariez de manière responsable. 18+ | Jouez responsable. Si vous ressentez le besoin d&apos;aide : 09 74 75 13 13 (appel non surtaxé).
        </p>
      </div>
    </div>
  );
}
