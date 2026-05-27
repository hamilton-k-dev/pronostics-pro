'use client';

import { useState } from 'react';
import Link from 'next/link';

const SCORES = [
  { id: 1, league: 'Ligue 1', home: 'PSG', away: 'Nice', homeScore: 3, awayScore: 1, status: 'Terminé', time: 'FT', date: "Aujourd'hui" },
  { id: 2, league: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeScore: 2, awayScore: 2, status: 'Terminé', time: 'FT', date: "Aujourd'hui" },
  { id: 3, league: 'La Liga', home: 'Atlético Madrid', away: 'Sevilla', homeScore: 1, awayScore: 0, status: 'Terminé', time: 'FT', date: "Aujourd'hui" },
  { id: 4, league: 'NBA', home: 'Lakers', away: 'Warriors', homeScore: 112, awayScore: 108, status: 'Terminé', time: 'OT', date: "Aujourd'hui" },
  { id: 5, league: 'Bundesliga', home: 'Bayern Munich', away: 'Dortmund', homeScore: 4, awayScore: 2, status: 'Terminé', time: 'FT', date: "Aujourd'hui" },
  { id: 6, league: 'Serie A', home: 'AC Milan', away: 'Roma', homeScore: 2, awayScore: 1, status: 'Terminé', time: 'FT', date: "Aujourd'hui" },
  { id: 7, league: 'Ligue 1', home: 'Lens', away: 'Lille', homeScore: 1, awayScore: 1, status: 'Terminé', time: 'FT', date: 'Hier' },
  { id: 8, league: 'Premier League', home: 'Manchester City', away: 'Liverpool', homeScore: 2, awayScore: 2, status: 'Terminé', time: 'FT', date: 'Hier' },
  { id: 9, league: 'NBA', home: 'Boston Celtics', away: 'Milwaukee Bucks', homeScore: 118, awayScore: 105, status: 'Terminé', time: 'FT', date: 'Hier' },
  { id: 10, league: 'La Liga', home: 'Real Madrid', away: 'Valence', homeScore: 3, awayScore: 0, status: 'Terminé', time: 'FT', date: 'Hier' },
  { id: 11, league: 'Roland Garros', home: 'Nadal', away: 'Alcaraz', homeScore: 3, awayScore: 1, status: 'Terminé', time: 'FT', date: '03/05' },
  { id: 12, league: 'Bundesliga', home: 'Leipzig', away: 'Stuttgart', homeScore: 2, awayScore: 1, status: 'Terminé', time: 'FT', date: '03/05' },
];

const LIVE_MATCHES = [
  { id: 99, league: 'Ligue 1', home: 'Monaco', away: 'Marseille', homeScore: 2, awayScore: 1, status: 'En cours', minute: 67, time: "67'", date: "Aujourd'hui" },
];

const LEAGUES = ['Toutes', 'Ligue 1', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'NBA', 'Roland Garros'];
const DATES = ["Aujourd'hui", 'Hier', '03/05', '02/05'];

export default function ScoresPage() {
  const [activeLeague, setActiveLeague] = useState('Toutes');
  const [activeDate, setActiveDate] = useState("Aujourd'hui");

  let liveFiltered = LIVE_MATCHES.filter((s) => s.date === activeDate);
  let filtered = SCORES.filter((s) => s.date === activeDate);

  if (activeLeague !== 'Toutes') {
    filtered = filtered.filter((s) => s.league === activeLeague);
    liveFiltered = liveFiltered.filter((s) => s.league === activeLeague);
  }

  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.league]) acc[s.league] = [];
    acc[s.league].push(s);
    return acc;
  }, {} as Record<string, typeof SCORES>);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Scores en direct</h1>
      <p className="text-sm text-slate-500 mb-6">Résultats et scores des matchs récents</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {DATES.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDate(d)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
              activeDate === d
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {LEAGUES.map((l) => (
          <button
            key={l}
            onClick={() => setActiveLeague(l)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
              activeLeague === l
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {liveFiltered.length > 0 && (
        <div className="space-y-6 mb-8">
          {liveFiltered.map((match) => (
            <div key={match.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 flex items-center justify-center text-red-500">
                  <i className="ri-trophy-line" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">{match.league}</h2>
                <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-600 rounded-full animate-pulse">LIVE</span>
              </div>
              <Link href={`/match/${match.id}`}>
                <div className="bg-white rounded-xl border-2 border-red-300 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xs font-bold text-red-500 w-8">{match.minute}&apos;</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{match.home}</span>
                          <span className="text-sm font-bold text-slate-900">{match.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{match.away}</span>
                          <span className="text-sm font-bold text-slate-900">{match.awayScore}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-red-500 ml-4 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {match.status}
                    </span>
                  </div>
                  <div className="px-5 py-2 bg-red-50 border-t border-red-100 text-center">
                    <span className="text-xs font-medium text-red-600">Cliquez pour suivre en direct et commenter</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-slate-300">
              <i className="ri-football-line text-3xl" />
            </div>
            <p className="text-sm text-slate-500">Aucun match pour cette sélection.</p>
          </div>
        )}

        {Object.entries(grouped).map(([league, matches]) => (
          <div key={league}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center text-indigo-600">
                <i className="ri-trophy-line" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">{league}</h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {matches.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    idx < matches.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs text-slate-400 w-8">{s.time}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{s.home}</span>
                        <span className="text-sm font-bold text-slate-900">{s.homeScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">{s.away}</span>
                        <span className="text-sm font-bold text-slate-900">{s.awayScore}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 ml-4">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
