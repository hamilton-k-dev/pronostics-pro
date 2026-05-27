'use client';

import Link from 'next/link';

const SCORES = [
  { id: 1, league: 'Ligue 1', home: 'PSG', away: 'Nice', homeScore: 3, awayScore: 1, status: 'Terminé', time: 'FT' },
  { id: 2, league: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeScore: 2, awayScore: 2, status: 'Terminé', time: 'FT' },
  { id: 3, league: 'La Liga', home: 'Atlético Madrid', away: 'Sevilla', homeScore: 1, awayScore: 0, status: 'Terminé', time: 'FT' },
  { id: 4, league: 'NBA', home: 'Lakers', away: 'Warriors', homeScore: 112, awayScore: 108, status: 'Terminé', time: 'OT' },
  { id: 5, league: 'Bundesliga', home: 'Bayern Munich', away: 'Dortmund', homeScore: 4, awayScore: 2, status: 'Terminé', time: 'FT' },
  { id: 6, league: 'Serie A', home: 'AC Milan', away: 'Roma', homeScore: 2, awayScore: 1, status: 'Terminé', time: 'FT' },
];

const LIVE_MATCHES = [
  { id: 99, league: 'Ligue 1', home: 'Monaco', away: 'Marseille', homeScore: 2, awayScore: 1, status: 'En cours', minute: 67, time: '67\'' },
];

export default function RecentScores() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-14 bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scores récents</h2>
          <p className="text-sm text-slate-500 mt-1">Résultats des matchs du jour</p>
        </div>
        <Link
          href="/scores"
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors"
        >
          Voir tous les scores →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIVE_MATCHES.map((s) => (
          <Link key={s.id} href={`/match/${s.id}`}>
            <div className="bg-white rounded-xl border-2 border-red-300 p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-600 rounded animate-pulse">
                  LIVE
                </span>
                <span className="text-xs text-slate-400">{s.league}</span>
                <span className="text-xs font-bold text-red-500 ml-auto">{s.minute}'</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{s.home}</span>
                  <span className="text-sm font-bold text-slate-900">{s.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{s.away}</span>
                  <span className="text-sm font-bold text-slate-900">{s.awayScore}</span>
                </div>
              </div>

              <p className="text-xs text-red-500 mt-3 text-center">Cliquez pour suivre en direct</p>
            </div>
          </Link>
        ))}
        {SCORES.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {s.league}
                </span>
                <span className="text-xs text-slate-400">{s.time}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{s.home}</span>
                  <span className="text-sm font-bold text-slate-900">{s.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{s.away}</span>
                  <span className="text-sm font-bold text-slate-900">{s.awayScore}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
