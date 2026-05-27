'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import BookmakerStickyBanner from '@/components/BookmakerStickyBanner';
import { useUserData } from '@/lib/user-data-context';
import { useEmailAlerts } from '@/lib/email-alerts-context';
import { useAuth } from '@/lib/auth-context';
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

const SPORT_TABS = ['Tous', 'Football', 'Basketball', 'Tennis'];

const CONFIDENCE_RANGES = [
  { label: 'Toutes', min: 0, max: 100 },
  { label: 'Forte (70%+)', min: 70, max: 100 },
  { label: 'Moyenne (55-69%)', min: 55, max: 69 },
  { label: 'Faible (<55%)', min: 0, max: 54 },
];

const ODDS_RANGES = [
  { label: 'Toutes', min: 0, max: 999 },
  { label: 'Sûre (< 1.70)', min: 0, max: 1.69 },
  { label: 'Modérée (1.70 - 2.20)', min: 1.70, max: 2.20 },
  { label: 'Risquée (> 2.20)', min: 2.21, max: 999 },
];

function getSportFromLeague(league: string): string {
  if (['Ligue 1', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga'].includes(league)) return 'Football';
  if (league === 'NBA') return 'Basketball';
  if (league === 'Roland Garros') return 'Tennis';
  return 'Tous';
}

function getStatusColor(result: string) {
  if (result === 'Gagné') return 'text-emerald-500';
  if (result === 'Perdu') return 'text-rose-500';
  if (result === 'En cours') return 'text-amber-500';
  return 'text-slate-400';
}

export default function PronosticsPage() {
  const [pronostics, setPronostics] = useState<PronosticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSport, setActiveSport] = useState('Tous');
  const [activeLeague, setActiveLeague] = useState<string>('Toutes');
  const [leagues, setLeagues] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [oddsFilter, setOddsFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { toggleFavorite, isFavorite, addToHistory, isInHistory } = useUserData();
  const { alerts, hasActiveAlerts } = useEmailAlerts();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('pronostics').select('*').order('created_at', { ascending: false });
      const list = (data as PronosticItem[]) || [];
      setPronostics(list);
      const uniqueLeagues = [...new Set(list.map((p) => p.league))].sort();
      setLeagues(uniqueLeagues);
      setLoading(false);
    }
    load();
  }, []);

  const alertMatched = useMemo(() => {
    const activeAlerts = alerts.filter(a => a.active);
    if (activeAlerts.length === 0) return [];
    return pronostics.filter(p => {
      const sport = getSportFromLeague(p.league);
      return activeAlerts.some(alert => {
        const sportMatch = alert.sport === 'Tous' || alert.sport === sport;
        const confidenceMatch = p.confidence >= alert.minConfidence;
        const oddsMatch = p.odds <= alert.maxOdds;
        return sportMatch && confidenceMatch && oddsMatch;
      });
    });
  }, [alerts, pronostics]);

  const filtered = useMemo(() => {
    let result = pronostics;

    if (activeLeague !== 'Toutes') {
      result = result.filter((p) => p.league === activeLeague);
    } else if (activeSport !== 'Tous') {
      if (activeSport === 'Football') {
        result = result.filter((p) => ['Ligue 1', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga'].includes(p.league));
      } else if (activeSport === 'Basketball') {
        result = result.filter((p) => p.league === 'NBA');
      } else if (activeSport === 'Tennis') {
        result = result.filter((p) => p.league === 'Roland Garros');
      }
    }

    const conf = CONFIDENCE_RANGES[confidenceFilter];
    result = result.filter((p) => p.confidence >= conf.min && p.confidence <= conf.max);

    const odds = ODDS_RANGES[oddsFilter];
    result = result.filter((p) => p.odds >= odds.min && p.odds <= odds.max);

    return result;
  }, [activeSport, activeLeague, confidenceFilter, oddsFilter, pronostics]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      {user && hasActiveAlerts && alertMatched.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full shrink-0">
                <i className="ri-mail-send-line text-lg" />
              </span>
              <div>
                <p className="text-sm font-semibold">Nouveaux pronostics correspondant à vos alertes</p>
                <p className="text-xs text-white/80">{alertMatched.length} pronostic{alertMatched.length > 1 ? 's' : ''} correspond{alertMatched.length > 1 ? 'ent' : ''} à vos critères</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const firstMatch = alertMatched[0];
                  if (firstMatch) {
                    const sport = getSportFromLeague(firstMatch.league);
                    setActiveSport(sport);
                    const confIdx = CONFIDENCE_RANGES.findIndex(r => firstMatch.confidence >= r.min && firstMatch.confidence <= r.max);
                    if (confIdx >= 0) setConfidenceFilter(confIdx);
                    const oddsIdx = ODDS_RANGES.findIndex(r => firstMatch.odds >= r.min && firstMatch.odds <= r.max);
                    if (oddsIdx >= 0) setOddsFilter(oddsIdx);
                  }
                }}
                className="px-3 py-1.5 bg-white text-indigo-700 text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Voir
              </button>
              <Link
                href="/compte/tableau-de-bord"
                className="px-3 py-1.5 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors whitespace-nowrap"
              >
                Gérer
              </Link>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {alertMatched.slice(0, 3).map(p => (
              <Link
                key={p.id}
                href={`/pronostic/${p.id}`}
                className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white/25 transition-colors"
              >
                <p className="text-xs font-medium truncate max-w-[180px]">{p.match_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{p.prediction}</span>
                  <span className="text-[10px] text-white/70">Cote {p.odds.toFixed(2)}</span>
                </div>
              </Link>
            ))}
            {alertMatched.length > 3 && (
              <div className="flex-shrink-0 flex items-center px-2">
                <span className="text-xs text-white/60">+{alertMatched.length - 3} autres</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Tous les pronostics</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap"
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className={showFilters ? 'ri-close-line' : 'ri-filter-3-line'} /></span>
          {showFilters ? 'Fermer' : 'Filtres'}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">Analyses détaillées et pronostics vérifiés par nos experts</p>

      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Ligue</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveLeague('Toutes')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  activeLeague === 'Toutes' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Toutes
              </button>
              {leagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setActiveLeague(league)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    activeLeague === league ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {league}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Confiance</p>
            <div className="flex items-center gap-2 flex-wrap">
              {CONFIDENCE_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setConfidenceFilter(i)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    confidenceFilter === i ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Cote</p>
            <div className="flex items-center gap-2 flex-wrap">
              {ODDS_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setOddsFilter(i)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    oddsFilter === i ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          {(activeLeague !== 'Toutes' || confidenceFilter !== 0 || oddsFilter !== 0) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">{filtered.length} résultat(s)</span>
              <button
                onClick={() => { setActiveLeague('Toutes'); setConfidenceFilter(0); setOddsFilter(0); }}
                className="text-xs font-medium text-indigo-700 hover:text-indigo-800"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-100 rounded-full w-fit">
        {SPORT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSport(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              activeSport === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="relative">
                  <Link
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

                  <div className="absolute top-3 right-14 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(p.id, p.match_name, p.prediction, p.odds, p.confidence);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isFavorite(p.id) ? 'bg-indigo-100 text-indigo-700' : 'bg-white/80 text-slate-400 hover:text-indigo-600'
                      }`}
                    >
                      <i className={isFavorite(p.id) ? 'ri-bookmark-fill text-sm' : 'ri-bookmark-line text-sm'} />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToHistory(p.id, p.match_name, p.prediction, p.odds, p.confidence, p.result);
                    }}
                    className={`absolute bottom-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                      isInHistory(p.id)
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-indigo-700 text-white hover:bg-indigo-800'
                    }`}
                  >
                    {isInHistory(p.id) ? 'Suivi' : 'Suivre'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300"><i className="ri-search-line text-2xl" /></span>
              <p className="text-sm text-slate-500">Aucun pronostic ne correspond à vos filtres</p>
              <button
                onClick={() => { setActiveLeague('Toutes'); setConfidenceFilter(0); setOddsFilter(0); setActiveSport('Tous'); }}
                className="mt-2 text-xs font-medium text-indigo-700 hover:text-indigo-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
        <BookmakerStickyBanner />
      </div>
    </div>
  );
}
