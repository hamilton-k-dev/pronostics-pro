'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Pronostic {
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
  home_stats?: Record<string, unknown>;
  away_stats?: Record<string, unknown>;
  home_injuries?: Record<string, unknown>[];
  away_injuries?: Record<string, unknown>[];
  home_absent?: string[];
  away_absent?: string[];
  justifications?: string[];
  h2h?: Record<string, unknown>[];
  other_predictions?: Record<string, unknown>[];
  key_players?: Record<string, unknown>[];
  bookmaker?: string;
  bookmaker_url?: string;
  bookmaker_bonus?: string;
  odds_comparison?: Record<string, unknown>[];
  created_at?: string;
}

export default function AdminPronosticDetailForm({
  pronostic,
  onClose,
  onSaved,
}: {
  pronostic: Pronostic;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<'basic' | 'teams' | 'stats' | 'injuries' | 'analysis' | 'bookmaker' | 'odds'>('basic');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Pronostic>(pronostic);

  useEffect(() => {
    setForm(pronostic);
  }, [pronostic.id]);

  function updateField<K extends keyof Pronostic>(field: K, value: Pronostic[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setArrayField(field: 'home_injuries' | 'away_injuries' | 'justifications' | 'h2h' | 'other_predictions' | 'key_players' | 'home_absent' | 'away_absent' | 'odds_comparison', index: number, key: string, value: string | number) {
    const arr = [...((form[field] as any[]) || [])];
    if (!arr[index]) arr[index] = {};
    arr[index] = { ...arr[index], [key]: value };
    updateField(field, arr as any);
  }

  function addArrayItem(field: 'home_injuries' | 'away_injuries' | 'justifications' | 'h2h' | 'other_predictions' | 'key_players' | 'home_absent' | 'away_absent' | 'odds_comparison') {
    const defaults: Record<string, any> = {
      home_injuries: { name: '', reason: '', returnDate: '' },
      away_injuries: { name: '', reason: '', returnDate: '' },
      justifications: '',
      h2h: { result: '', score: '', date: '' },
      other_predictions: { type: '', prediction: '', confidence: 60, odds: '' },
      key_players: { name: '', team: 'home', stats: '' },
      home_absent: '',
      away_absent: '',
    };
    const arr = [...((form[field] as any[]) || [])];
    arr.push(defaults[field]);
    updateField(field, arr as any);
  }

  function removeArrayItem(field: 'home_injuries' | 'away_injuries' | 'justifications' | 'h2h' | 'other_predictions' | 'key_players' | 'home_absent' | 'away_absent' | 'odds_comparison', index: number) {
    const arr = [...((form[field] as any[]) || [])];
    arr.splice(index, 1);
    updateField(field, arr as any);
  }

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, any> = {
      home_team: form.home_team || null,
      away_team: form.away_team || null,
      venue: form.venue || null,
      referee: form.referee || null,
      weather: form.weather || null,
      temperature: form.temperature || null,
      home_stats: form.home_stats || null,
      away_stats: form.away_stats || null,
      home_injuries: form.home_injuries || null,
      away_injuries: form.away_injuries || null,
      home_absent: form.home_absent || null,
      away_absent: form.away_absent || null,
      justifications: form.justifications || null,
      h2h: form.h2h || null,
      other_predictions: form.other_predictions || null,
      key_players: form.key_players || null,
      bookmaker: form.bookmaker || null,
      bookmaker_url: form.bookmaker_url || null,
      bookmaker_bonus: form.bookmaker_bonus || null,
      odds_comparison: form.odds_comparison || null,
    };
    await supabase.from('pronostics').update(payload).eq('id', pronostic.id);

    const currentOdds = (form.odds_comparison || []) as { bookmaker?: string; odds?: number }[];
    if (currentOdds.length > 0) {
      const { data: latestHistory } = await supabase
        .from('odds_history')
        .select('bookmaker_name, odds')
        .eq('pronostic_id', pronostic.id)
        .order('recorded_at', { ascending: false });

      const latestByBookmaker: Record<string, number> = {};
      if (latestHistory) {
        for (const h of latestHistory) {
          const name = (h as any).bookmaker_name;
          const odds = (h as any).odds;
          if (name && latestByBookmaker[name] === undefined) {
            latestByBookmaker[name] = Number(odds);
          }
        }
      }

      const historyInserts: { pronostic_id: number; bookmaker_name: string; odds: number }[] = [];
      for (const entry of currentOdds) {
        if (entry.bookmaker && entry.odds) {
          const lastOdds = latestByBookmaker[String(entry.bookmaker)];
          if (lastOdds === undefined || Number(lastOdds) !== Number(entry.odds)) {
            historyInserts.push({
              pronostic_id: pronostic.id,
              bookmaker_name: String(entry.bookmaker),
              odds: Number(entry.odds),
            });
          }
        }
      }

      if (historyInserts.length > 0) {
        await supabase.from('odds_history').insert(historyInserts);
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  const tabs = [
    { key: 'basic', label: 'Infos' },
    { key: 'teams', label: 'Équipes' },
    { key: 'stats', label: 'Stats' },
    { key: 'injuries', label: 'Blessures' },
    { key: 'analysis', label: 'Analyse' },
    { key: 'bookmaker', label: 'Bookmaker' },
    { key: 'odds', label: 'Cotes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-semibold text-slate-900">Données détaillées — {pronostic.match_name}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="px-5 py-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Équipe domicile" value={form.home_team || ''} onChange={(v) => updateField('home_team', v)} />
              <Input label="Équipe extérieur" value={form.away_team || ''} onChange={(v) => updateField('away_team', v)} />
              <Input label="Stade / Lieu" value={form.venue || ''} onChange={(v) => updateField('venue', v)} />
              <Input label="Arbitre" value={form.referee || ''} onChange={(v) => updateField('referee', v)} />
              <Input label="Météo" value={form.weather || ''} onChange={(v) => updateField('weather', v)} />
              <Input label="Température" value={form.temperature || ''} onChange={(v) => updateField('temperature', v)} />
            </div>
          )}

          {tab === 'teams' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Domicile — {form.home_team || '?'}</h4>
                  <StatsEditor stats={form.home_stats || {}} onChange={(s) => updateField('home_stats', s)} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Extérieur — {form.away_team || '?'}</h4>
                  <StatsEditor stats={form.away_stats || {}} onChange={(s) => updateField('away_stats', s)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-6">
              <ArraySection
                title="Blessés domicile"
                items={form.home_injuries || []}
                fields={[
                  { key: 'name', label: 'Nom', type: 'text' },
                  { key: 'reason', label: 'Raison', type: 'text' },
                  { key: 'returnDate', label: 'Retour estimé', type: 'text' },
                ]}
                onAdd={() => addArrayItem('home_injuries')}
                onRemove={(i) => removeArrayItem('home_injuries', i)}
                onChange={(i, k, v) => setArrayField('home_injuries', i, k, v)}
              />
              <ArraySection
                title="Blessés extérieur"
                items={form.away_injuries || []}
                fields={[
                  { key: 'name', label: 'Nom', type: 'text' },
                  { key: 'reason', label: 'Raison', type: 'text' },
                  { key: 'returnDate', label: 'Retour estimé', type: 'text' },
                ]}
                onAdd={() => addArrayItem('away_injuries')}
                onRemove={(i) => removeArrayItem('away_injuries', i)}
                onChange={(i, k, v) => setArrayField('away_injuries', i, k, v)}
              />
            </div>
          )}

          {tab === 'injuries' && (
            <div className="space-y-6">
              <StringArraySection
                title="Absents / Suspensions domicile"
                items={form.home_absent || []}
                onAdd={() => addArrayItem('home_absent')}
                onRemove={(i) => removeArrayItem('home_absent', i)}
                onChange={(i, v) => {
                  const arr = [...(form.home_absent || [])];
                  arr[i] = v;
                  updateField('home_absent', arr);
                }}
              />
              <StringArraySection
                title="Absents / Suspensions extérieur"
                items={form.away_absent || []}
                onAdd={() => addArrayItem('away_absent')}
                onRemove={(i) => removeArrayItem('away_absent', i)}
                onChange={(i, v) => {
                  const arr = [...(form.away_absent || [])];
                  arr[i] = v;
                  updateField('away_absent', arr);
                }}
              />
            </div>
          )}

          {tab === 'bookmaker' && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-briefcase-4-line" /></span>
                  Lien d&apos;affiliation Bookmaker
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nom du bookmaker" value={form.bookmaker || ''} onChange={(v) => updateField('bookmaker', v)} />
                  <Input label="URL d'affiliation" value={form.bookmaker_url || ''} onChange={(v) => updateField('bookmaker_url', v)} />
                  <div className="md:col-span-2">
                    <Input label="Bonus / Offre affiché (ex: 100€ de bonus)" value={form.bookmaker_bonus || ''} onChange={(v) => updateField('bookmaker_bonus', v)} />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h5 className="text-xs font-semibold text-slate-700 mb-2">Prévisualisation du bandeau</h5>
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg text-white"><i className="ri-briefcase-4-line text-lg" /></span>
                    <div>
                      <p className="text-sm font-semibold text-white">{form.bookmaker || 'Nom du bookmaker'}</p>
                      <p className="text-xs text-emerald-100">{form.bookmaker_bonus || "Bonus à l'inscription"}</p>
                    </div>
                  </div>
                  <button className="px-5 py-2 bg-white text-emerald-700 text-sm font-semibold rounded-lg whitespace-nowrap">
                    Parier ici
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'odds' && (
            <div className="space-y-5">
              <ArraySection
                title="Cotes par bookmaker"
                items={form.odds_comparison || []}
                fields={[
                  { key: 'bookmaker', label: 'Bookmaker', type: 'text' },
                  { key: 'odds', label: 'Cote', type: 'number' },
                  { key: 'url', label: 'URL', type: 'text' },
                ]}
                onAdd={() => addArrayItem('odds_comparison')}
                onRemove={(i) => removeArrayItem('odds_comparison', i)}
                onChange={(i, k, v) => setArrayField('odds_comparison', i, k, v)}
              />
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Saisissez une cote par bookmaker actif. La cote la plus élevée sera mise en avant comme &quot;Meilleure cote&quot; sur la fiche pronostic.
                  Si aucune cote n&apos;est renseignée pour un bookmaker, il apparaîtra quand même dans le comparateur avec un lien générique.
                </p>
              </div>
            </div>
          )}

          {tab === 'analysis' && (
            <div className="space-y-6">
              <StringArraySection
                title="Justifications du pronostic"
                items={form.justifications || []}
                onAdd={() => addArrayItem('justifications')}
                onRemove={(i) => removeArrayItem('justifications', i)}
                onChange={(i, v) => {
                  const arr = [...(form.justifications || [])];
                  arr[i] = v;
                  updateField('justifications', arr);
                }}
              />

              <ArraySection
                title="Historique confrontations (H2H)"
                items={form.h2h || []}
                fields={[
                  { key: 'date', label: 'Date', type: 'text' },
                  { key: 'score', label: 'Score', type: 'text' },
                  { key: 'result', label: 'Résultat', type: 'text' },
                ]}
                onAdd={() => addArrayItem('h2h')}
                onRemove={(i) => removeArrayItem('h2h', i)}
                onChange={(i, k, v) => setArrayField('h2h', i, k, v)}
              />

              <ArraySection
                title="Autres pronostics du match"
                items={form.other_predictions || []}
                fields={[
                  { key: 'type', label: 'Type', type: 'text' },
                  { key: 'prediction', label: 'Pronostic', type: 'text' },
                  { key: 'confidence', label: 'Confiance (%)', type: 'number' },
                  { key: 'odds', label: 'Cote', type: 'text' },
                ]}
                onAdd={() => addArrayItem('other_predictions')}
                onRemove={(i) => removeArrayItem('other_predictions', i)}
                onChange={(i, k, v) => setArrayField('other_predictions', i, k, v)}
              />

              <ArraySection
                title="Joueurs clés"
                items={form.key_players || []}
                fields={[
                  { key: 'name', label: 'Nom', type: 'text' },
                  { key: 'team', label: 'Équipe (home/away)', type: 'text' },
                  { key: 'stats', label: 'Stats', type: 'text' },
                ]}
                onAdd={() => addArrayItem('key_players')}
                onRemove={(i) => removeArrayItem('key_players', i)}
                onChange={(i, k, v) => setArrayField('key_players', i, k, v)}
              />
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function StatsEditor({ stats, onChange }: { stats: Record<string, unknown>; onChange: (s: Record<string, unknown>) => void }) {
  const fields = [
    { key: 'last5', label: 'Forme (5 derniers)' },
    { key: 'wins', label: 'Victoires', type: 'number' },
    { key: 'draws', label: 'Nuls', type: 'number' },
    { key: 'losses', label: 'Défaites', type: 'number' },
    { key: 'goalsFor', label: 'Buts marqués', type: 'number' },
    { key: 'goalsAgainst', label: 'Buts encaissés', type: 'number' },
    { key: 'homeForm', label: 'Forme domicile' },
    { key: 'awayForm', label: 'Forme extérieur' },
    { key: 'ranking', label: 'Classement', type: 'number' },
    { key: 'points', label: 'Points', type: 'number' },
  ];

  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <label className="text-xs text-slate-500 w-32 shrink-0">{f.label}</label>
          <input
            type={f.type || 'text'}
            value={String(stats[f.key] ?? '')}
            onChange={(e) => {
              const v = f.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
              const next = { ...stats, [f.key]: v };
              if (e.target.value === '') delete (next as any)[f.key];
              onChange(next);
            }}
            className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
    </div>
  );
}

function ArraySection({
  title,
  items,
  fields,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  items: Record<string, unknown>[];
  fields: { key: string; label: string; type?: string }[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, key: string, value: string | number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-700">{title}</h4>
        <button onClick={onAdd} className="text-xs font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1">
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></span>
          Ajouter
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-slate-400 italic">Aucune entrée</p>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-500 mb-0.5">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={String(item[f.key] ?? '')}
                    onChange={(e) => onChange(i, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <button onClick={() => onRemove(i)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shrink-0">
              <i className="ri-delete-bin-line text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StringArraySection({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  items: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-700">{title}</h4>
        <button onClick={onAdd} className="text-xs font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1">
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></span>
          Ajouter
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-slate-400 italic">Aucune entrée</p>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={() => onRemove(i)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
              <i className="ri-delete-bin-line text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
