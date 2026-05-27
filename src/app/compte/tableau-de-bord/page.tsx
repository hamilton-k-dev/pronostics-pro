'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useUserData } from '@/lib/user-data-context';
import { WinRatePie, MonthlyProfitChart, StreakChart } from '@/components/PerformanceCharts';
import EmailAlertManager from '@/components/EmailAlertManager';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { favorites, history, removeFromHistory, stats } = useUserData();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'alerts'>('favorites');

  if (!user) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 text-center">
        <span className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-slate-300">
          <i className="ri-user-line text-3xl" />
        </span>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Connectez-vous</h1>
        <p className="text-sm text-slate-500 mb-6">Accédez à votre tableau de bord en vous connectant</p>
        <Link href="/connexion" className="px-5 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">Bienvenue, {user.name} !</p>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line" /></span>
          Déconnexion
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Pronostics suivis</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Gagnés</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.wins}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Perdus</p>
          <p className="text-2xl font-bold text-rose-500">{stats.losses}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Taux de réussite</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.winRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Distribution des résultats</h3>
          <p className="text-xs text-slate-400 mb-4">Répartition de tes pronostics gagnés, perdus et en cours</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <WinRatePie wins={stats.wins} losses={stats.losses} total={stats.total} winRate={stats.winRate} profit={stats.profit} />
            </div>
            <div className="space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600">Gagnés ({stats.wins})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs text-slate-600">Perdus ({stats.losses})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-600">En cours ({stats.total - stats.wins - stats.losses})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Série de résultats</h3>
          <p className="text-xs text-slate-400 mb-4">Tes 10 derniers pronostics</p>
          <StreakChart />
          <div className="flex items-center gap-4 mt-3 justify-center">
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Gagné</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Perdu</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Nul</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500">Profit estimé</p>
            <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(1)} €
            </p>
          </div>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${Math.min(stats.winRate, 100)}%` }}
            />
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Évolution du profit (€)</p>
          <MonthlyProfitChart />
        </div>
        <p className="text-xs text-slate-400 mt-3">Basé sur une mise de 10 € par pronostic</p>
      </div>

      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-100 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'favorites' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-bookmark-line" /></span>
          Favoris ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-history-line" /></span>
          Historique ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'alerts' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-line" /></span>
          Alertes
        </button>
      </div>

      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300">
                <i className="ri-bookmark-line text-3xl" />
              </span>
              <p className="text-sm text-slate-500 mb-2">Aucun favori</p>
              <p className="text-xs text-slate-400 mb-4">Enregistrez vos pronostics préférés pour les retrouver ici</p>
              <Link href="/pronostics" className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors">
                Découvrir les pronostics
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((f) => (
                <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">Favori</span>
                    <span className="text-xs text-slate-400">{new Date(f.addedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{f.match}</h3>
                  <p className="text-xs text-slate-500 mb-4">{f.prediction}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Cote</p>
                      <p className="text-sm font-bold text-indigo-700">{f.odds.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Confiance</p>
                      <p className="text-sm font-semibold text-slate-700">{f.confidence}%</p>
                    </div>
                  </div>
                  <Link
                    href={`/pronostic/${f.id}`}
                    className="block w-full text-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Voir le détail
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300">
                <i className="ri-history-line text-3xl" />
              </span>
              <p className="text-sm text-slate-500 mb-2">Historique vide</p>
              <p className="text-xs text-slate-400 mb-4">Suivez des pronostics pour les voir apparaître ici</p>
              <Link href="/pronostics" className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors">
                Découvrir les pronostics
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      h.result === 'Gagné' ? 'bg-emerald-100 text-emerald-600' : h.result === 'Perdu' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <i className={h.result === 'Gagné' ? 'ri-check-line' : h.result === 'Perdu' ? 'ri-close-line' : 'ri-time-line'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{h.match}</p>
                      <p className="text-xs text-slate-500">{h.prediction} — Cote {h.odds.toFixed(2)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold ${
                        h.result === 'Gagné' ? 'text-emerald-600' : h.result === 'Perdu' ? 'text-rose-500' : 'text-amber-500'
                      }`}>{h.result}</span>
                      <p className="text-xs text-slate-400">{new Date(h.followedAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => removeFromHistory(h.pronosticId)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <EmailAlertManager />
      )}
    </div>
  );
}
