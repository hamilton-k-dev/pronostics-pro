'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SocialShare from '@/components/SocialShare';
import PronosticComments from '@/components/PronosticComments';
import OddsComparison from '@/components/OddsComparison';
import OddsHistoryChart from '@/components/OddsHistoryChart';
import { supabase } from '@/lib/supabase';
import { trackAffiliateClick } from '@/lib/use-affiliate-track';

interface TeamStats {
  last5?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  homeForm?: string;
  awayForm?: string;
  ranking?: number;
  points?: number;
}

interface InjuredPlayer {
  name: string;
  reason: string;
  returnDate?: string;
}

interface OtherPrediction {
  type: string;
  prediction: string;
  confidence: number;
  odds: string;
}

interface KeyPlayer {
  name: string;
  team: 'home' | 'away';
  stats: string;
}

interface H2HMatch {
  result: string;
  score: string;
  date: string;
}

interface DbPronostic {
  id: number;
  league: string;
  match_name: string;
  match_date: string;
  prediction: string;
  confidence: number;
  odds: number;
  result: string;
  home_team?: string;
  away_team?: string;
  venue?: string;
  referee?: string;
  weather?: string;
  temperature?: string;
  home_stats?: TeamStats;
  away_stats?: TeamStats;
  home_injuries?: InjuredPlayer[];
  away_injuries?: InjuredPlayer[];
  home_absent?: string[];
  away_absent?: string[];
  justifications?: string[];
  h2h?: H2HMatch[];
  other_predictions?: OtherPrediction[];
  key_players?: KeyPlayer[];
  bookmaker?: string;
  bookmaker_url?: string;
  bookmaker_bonus?: string;
  odds_comparison?: { bookmaker: string; odds: number; url: string }[];
  created_at: string;
}

function getStatusColor(result: string) {
  if (result === 'Gagné') return 'text-emerald-500';
  if (result === 'Perdu') return 'text-rose-500';
  if (result === 'En cours') return 'text-amber-500';
  return 'text-slate-400';
}

export default function PronosticDetail({ pronosticId }: { pronosticId: string }) {
  const [activeOtherTab, setActiveOtherTab] = useState<'details' | 'other'>('details');
  const [data, setData] = useState<DbPronostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: dbPronostic } = await supabase
        .from('pronostics')
        .select('*')
        .eq('id', pronosticId)
        .maybeSingle();
      setData(dbPronostic as DbPronostic | null);
      setLoading(false);
    }
    load();
  }, [pronosticId]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 text-center">
        <div className="w-10 h-10 mx-auto mb-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Chargement du pronostic...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Pronostic introuvable</h1>
        <p className="text-sm text-slate-500 mb-6">Ce pronostic n&apos;existe pas ou a été supprimé.</p>
        <Link href="/pronostics" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
          Retour aux pronostics
        </Link>
      </div>
    );
  }

  const hasDetails =
    data.home_team ||
    data.away_team ||
    data.venue ||
    data.home_stats ||
    data.away_stats ||
    (data.home_injuries && data.home_injuries.length > 0) ||
    (data.away_injuries && data.away_injuries.length > 0) ||
    (data.justifications && data.justifications.length > 0) ||
    (data.h2h && data.h2h.length > 0) ||
    (data.key_players && data.key_players.length > 0);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <Link href="/pronostics" className="text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors mb-6 inline-flex items-center gap-1">
        <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line" /></span>
        Retour aux pronostics
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">{data.league}</span>
          <div className="flex items-center gap-3">
            <SocialShare
              match={data.match_name}
              prediction={data.prediction}
              odds={String(data.odds)}
              confidence={data.confidence}
              pronosticId={pronosticId}
            />
            <span className={`text-xs font-semibold ${getStatusColor(data.result)}`}>{data.result}</span>
          </div>
        </div>

        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">{data.match_name}</h1>
          <p className="text-sm text-slate-500">{data.match_date}</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Pronostic principal</p>
              <p className="text-lg font-bold text-indigo-700">{data.prediction}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Cote</p>
              <p className="text-lg font-bold text-indigo-700">{data.odds.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Confiance</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-indigo-700">{data.confidence}%</p>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${data.confidence >= 70 ? 'bg-emerald-500' : data.confidence >= 55 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${data.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {(data.venue || data.referee || data.weather || data.temperature) && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.venue && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-map-pin-line" /></span>
                <span className="text-xs text-slate-600">{data.venue}</span>
              </div>
            )}
            {data.referee && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-user-star-line" /></span>
                <span className="text-xs text-slate-600">Arbitre : {data.referee}</span>
              </div>
            )}
            {data.weather && data.temperature && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-cloud-line" /></span>
                <span className="text-xs text-slate-600">{data.weather}, {data.temperature}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-slate-400"><i className="ri-calendar-line" /></span>
              <span className="text-xs text-slate-600">J{data.id} de la saison</span>
            </div>
          </div>
        )}
      </div>

      {data.bookmaker && data.bookmaker_url && (
        <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg text-white"><i className="ri-briefcase-4-line text-lg" /></span>
              <div>
                <p className="text-sm font-semibold text-white">{data.bookmaker}</p>
                <p className="text-xs text-emerald-100">{data.bookmaker_bonus || "Offre de bienvenue à l'inscription"}</p>
              </div>
            </div>
            <a
              href={data.bookmaker_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick(data.bookmaker!, { sourcePage: window.location.pathname, pronosticId: data.id })}
              className="px-5 py-2.5 bg-white text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <span className="w-4 h-4 flex items-center justify-center"><i className="ri-external-link-line" /></span>
              Parier sur {data.bookmaker}
            </a>
          </div>
        </div>
      )}

      <OddsComparison
        pronosticId={data.id}
        oddsData={data.odds_comparison || null}
        matchName={data.match_name}
      />

      <div className="mt-6">
        <OddsHistoryChart pronosticId={data.id} />
      </div>

      <div className="mt-6">
        <PronosticComments pronosticId={pronosticId} />
      </div>

      {hasDetails && (
        <>
          <div className="flex items-center gap-2 mb-6 mt-6 p-1 bg-slate-100 rounded-full w-fit">
            <button
              onClick={() => setActiveOtherTab('details')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${activeOtherTab === 'details' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Détails du pronostic
            </button>
            <button
              onClick={() => setActiveOtherTab('other')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${activeOtherTab === 'other' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Autres pronostics ({data.other_predictions?.length ?? 0})
            </button>
          </div>

          {activeOtherTab === 'details' && (
            <div className="space-y-6">
              {(data.home_team || data.away_team) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TeamCard
                    team={data.home_team || ''}
                    stats={data.home_stats || {}}
                    injuries={data.home_injuries || []}
                    absent={data.home_absent || []}
                    isHome
                  />
                  <TeamCard
                    team={data.away_team || ''}
                    stats={data.away_stats || {}}
                    injuries={data.away_injuries || []}
                    absent={data.away_absent || []}
                    isHome={false}
                  />
                </div>
              )}

              {data.justifications && data.justifications.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-shield-check-line" /></span>
                    <h2 className="text-sm font-semibold text-slate-900">Pourquoi ce pronostic ?</h2>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {data.justifications.map((j, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-slate-700">{j}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.h2h && data.h2h.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-exchange-line" /></span>
                    <h2 className="text-sm font-semibold text-slate-900">Historique des confrontations (H2H)</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.h2h.map((h, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3">
                        <span className="text-xs text-slate-500">{h.date}</span>
                        <span className="text-sm font-semibold text-slate-900">{h.score}</span>
                        <span className={`text-xs font-medium ${h.result.includes(data.home_team || '') ? 'text-emerald-600' : h.result.includes(data.away_team || '') ? 'text-rose-500' : 'text-slate-500'}`}>
                          {h.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.key_players && data.key_players.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-star-line" /></span>
                    <h2 className="text-sm font-semibold text-slate-900">Joueurs clés</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-4">
                    {data.key_players.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${p.team === 'home' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.stats}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeOtherTab === 'other' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Autres pronostics analysés pour ce même match par nos experts</p>
              {(!data.other_predictions || data.other_predictions.length === 0) && (
                <p className="text-sm text-slate-400">Aucun autre pronostic pour ce match.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.other_predictions?.map((op, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">{op.type}</span>
                      <span className="text-sm font-bold text-indigo-700">{op.odds}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-4">{op.prediction}</p>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Fiabilité</span>
                        <span className="text-xs font-semibold text-slate-700">{op.confidence}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${op.confidence >= 70 ? 'bg-emerald-500' : op.confidence >= 55 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${op.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TeamCard({ team, stats, injuries, absent, isHome }: {
  team: string;
  stats: TeamStats;
  injuries: InjuredPlayer[];
  absent: string[];
  isHome: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <span className={`w-5 h-5 flex items-center justify-center ${isHome ? 'text-indigo-600' : 'text-slate-600'}`}>
          <i className={isHome ? 'ri-home-4-line' : 'ri-plane-line'} />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">{team}</h2>
        {(stats.points !== undefined || stats.ranking !== undefined) && (
          <span className="text-xs text-slate-400 ml-auto">
            {stats.points !== undefined ? `${stats.points} pts` : ''}
            {stats.points !== undefined && stats.ranking !== undefined ? ' — ' : ''}
            {stats.ranking !== undefined ? `#${stats.ranking}` : ''}
          </span>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        {(stats.wins !== undefined || stats.draws !== undefined || stats.losses !== undefined) && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-lg font-bold text-emerald-600">{stats.wins ?? 0}</p>
              <p className="text-xs text-slate-500">Victoires</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-lg font-bold text-slate-600">{stats.draws ?? 0}</p>
              <p className="text-xs text-slate-500">Nuls</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-lg font-bold text-rose-500">{stats.losses ?? 0}</p>
              <p className="text-xs text-slate-500">Défaites</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {stats.last5 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Forme (5 derniers)</span>
              <span className="font-medium text-slate-700">{stats.last5}</span>
            </div>
          )}
          {(isHome ? stats.homeForm : stats.awayForm) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{isHome ? 'Forme domicile' : 'Forme extérieur'}</span>
              <span className="font-medium text-slate-700">{isHome ? stats.homeForm : stats.awayForm}</span>
            </div>
          )}
          {stats.goalsFor !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Buts marqués</span>
              <span className="font-medium text-slate-700">{stats.goalsFor}</span>
            </div>
          )}
          {stats.goalsAgainst !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Buts encaissés</span>
              <span className="font-medium text-slate-700">{stats.goalsAgainst}</span>
            </div>
          )}
        </div>

        {injuries.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center text-rose-500"><i className="ri-hospital-line" /></span>
              Joueurs blessés
            </p>
            <div className="space-y-2">
              {injuries.map((inj, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{inj.name}</span>
                  <span className="text-slate-500">{inj.reason}{inj.returnDate ? ` — Retour : ${inj.returnDate}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {absent.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
              <span className="w-4 h-4 flex items-center justify-center text-amber-500"><i className="ri-user-unfollow-line" /></span>
              Absents / Suspensions
            </p>
            <div className="flex flex-wrap gap-2">
              {absent.map((a, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
