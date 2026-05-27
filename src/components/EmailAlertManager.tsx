'use client';

import { useState } from 'react';
import { useEmailAlerts } from '@/lib/email-alerts-context';

const SPORT_OPTIONS = ['Tous', 'Football', 'Basketball', 'Tennis'];

export default function EmailAlertManager() {
  const { alerts, addAlert, removeAlert, toggleAlert } = useEmailAlerts();
  const [sport, setSport] = useState('Tous');
  const [minConfidence, setMinConfidence] = useState(70);
  const [maxOdds, setMaxOdds] = useState(3.0);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAlert(sport, minConfidence, maxOdds);
    setShowForm(false);
    setSport('Tous');
    setMinConfidence(70);
    setMaxOdds(3.0);
  };

  const sportLabel = (s: string) => {
    if (s === 'Tous') return 'Tous les sports';
    return s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Mes alertes email</h2>
          <p className="text-sm text-slate-500 mt-1">Configurez les critères pour recevoir des notifications sur les nouveaux pronostics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className={showForm ? 'ri-close-line' : 'ri-add-line'} /></span>
          {showForm ? 'Annuler' : 'Nouvelle alerte'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Nouvelle alerte</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Sport</label>
              <div className="flex items-center gap-2 flex-wrap">
                {SPORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSport(s)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      sport === s ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Confiance minimum : <span className="font-bold text-indigo-700">{minConfidence}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-700"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Cote maximum : <span className="font-bold text-indigo-700">{maxOdds.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={1.01}
                max={10}
                step={0.05}
                value={maxOdds}
                onChange={(e) => setMaxOdds(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-700"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1.01</span>
                <span>5.00</span>
                <span>10.00</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
            >
              Créer l&apos;alerte
            </button>
          </form>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300">
            <i className="ri-mail-line text-3xl" />
          </span>
          <p className="text-sm text-slate-500 mb-2">Aucune alerte configurée</p>
          <p className="text-xs text-slate-400">Créez votre première alerte pour être notifié des nouveaux pronostics</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                    alert.active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                      alert.active ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {sportLabel(alert.sport)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Confiance ≥ {alert.minConfidence}% — Cote ≤ {alert.maxOdds.toFixed(2)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  alert.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {alert.active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => removeAlert(alert.id)}
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
  );
}
