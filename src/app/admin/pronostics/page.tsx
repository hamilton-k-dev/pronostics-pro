'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';
import AdminPronosticDetailForm from '@/components/AdminPronosticDetailForm';

interface Pronostic {
  id: number;
  league: string;
  match_name: string;
  match_date: string;
  prediction: string;
  confidence: number;
  odds: number;
  result: string;
  created_at: string;
  bookmaker?: string;
  bookmaker_url?: string;
  bookmaker_bonus?: string;
}

export default function AdminPronosticsPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [items, setItems] = useState<Pronostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pronostic | null>(null);
  const [filter, setFilter] = useState('');
  const [detailForm, setDetailForm] = useState<Pronostic | null>(null);

  const [form, setForm] = useState<any>({
    league: 'Ligue 1',
    match_name: '',
    match_date: '',
    prediction: '',
    confidence: 70,
    odds: 1.75,
    result: 'En attente',
    bookmaker: '',
    bookmaker_url: '',
    bookmaker_bonus: '',
  });

  const RESULT_OPTIONS = ['En attente', 'En cours', 'Gagné', 'Perdu'];
  const LEAGUE_OPTIONS = ['Ligue 1', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'NBA', 'Roland Garros'];

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadItems();
  }, [admin, router]);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase.from('pronostics').select('*').order('created_at', { ascending: false });
    if (data) {
      setItems(data);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  const filtered = items.filter((p) => {
    const q = filter.toLowerCase();
    return (
      p.match_name.toLowerCase().includes(q) ||
      p.prediction.toLowerCase().includes(q) ||
      p.league.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('pronostics').update(form).eq('id', editing.id);
    } else {
      await supabase.from('pronostics').insert(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm({
      league: 'Ligue 1',
      match_name: '',
      match_date: '',
      prediction: '',
      confidence: 70,
      odds: 1.75,
      result: 'En attente',
      bookmaker: '',
      bookmaker_url: '',
      bookmaker_bonus: '',
    });
    loadItems();
  };

  const handleEdit = (p: Pronostic) => {
    setEditing(p);
    setForm({
      league: p.league,
      match_name: p.match_name,
      match_date: p.match_date,
      prediction: p.prediction,
      confidence: p.confidence,
      odds: p.odds,
      result: p.result,
      bookmaker: p.bookmaker || '',
      bookmaker_url: p.bookmaker_url || '',
      bookmaker_bonus: p.bookmaker_bonus || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce pronostic ?')) return;
    await supabase.from('pronostics').delete().eq('id', id);
    loadItems();
  };

  const handleStatusChange = async (id: number, newResult: string) => {
    await supabase.from('pronostics').update({ result: newResult }).eq('id', id);
    loadItems();
  };

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des pronostics</h1>
          <p className="text-sm text-slate-500 mt-1">Créer, modifier et supprimer les pronostics</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></span>
          Nouveau
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher un match, une prédiction..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {editing ? 'Modifier le pronostic' : 'Nouveau pronostic'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ligue</label>
              <div className="flex flex-wrap gap-2">
                {LEAGUE_OPTIONS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm((f: any) => ({ ...f, league: l }))}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      form.league === l ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Match</label>
              <input
                type="text"
                value={form.match_name}
                onChange={(e) => setForm((f: any) => ({ ...f, match_name: e.target.value }))}
                placeholder="PSG vs Marseille"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date &amp; Heure</label>
              <input
                type="text"
                value={form.match_date}
                onChange={(e) => setForm((f: any) => ({ ...f, match_date: e.target.value }))}
                placeholder="03/05/2025 - 21h00"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pronostic</label>
              <input
                type="text"
                value={form.prediction}
                onChange={(e) => setForm((f: any) => ({ ...f, prediction: e.target.value }))}
                placeholder="Victoire PSG"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confiance : <span className="font-bold text-indigo-700">{form.confidence}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.confidence}
                onChange={(e) => setForm((f: any) => ({ ...f, confidence: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cote</label>
              <input
                type="number"
                step={0.01}
                min={1.01}
                value={form.odds}
                onChange={(e) => setForm((f: any) => ({ ...f, odds: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Résultat</label>
              <div className="flex flex-wrap gap-2">
                {RESULT_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f: any) => ({ ...f, result: r }))}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      form.result === r ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Bookmaker &amp; Lien d&apos;affiliation</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.bookmaker}
                  onChange={(e) => setForm((f: any) => ({ ...f, bookmaker: e.target.value }))}
                  placeholder="Nom du bookmaker (ex: Winamax)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={form.bookmaker_url}
                  onChange={(e) => setForm((f: any) => ({ ...f, bookmaker_url: e.target.value }))}
                  placeholder="URL d'affiliation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                value={form.bookmaker_bonus}
                onChange={(e) => setForm((f: any) => ({ ...f, bookmaker_bonus: e.target.value }))}
                placeholder="Bonus affiché (ex: 100€ de bonus de bienvenue)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
              >
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ligue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Match</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Pronostic</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Confiance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Cote</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bookmaker</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Résultat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Aucun pronostic trouvé</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{p.league}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{p.match_name}</p>
                      <p className="text-xs text-slate-400">{p.match_date}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.prediction}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        p.confidence >= 70 ? 'text-emerald-600' : p.confidence >= 55 ? 'text-amber-600' : 'text-rose-500'
                      }`}>{p.confidence}%</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{p.odds}</td>
                    <td className="px-4 py-3">
                      {p.bookmaker ? (
                        <a href={p.bookmaker_url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors">
                          {p.bookmaker}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          const next = RESULT_OPTIONS[(RESULT_OPTIONS.indexOf(p.result) + 1) % RESULT_OPTIONS.length];
                          handleStatusChange(p.id, next);
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          p.result === 'Gagné' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                          p.result === 'Perdu' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' :
                          p.result === 'En cours' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                          'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.result}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailForm(p)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Données détaillées"
                        >
                          <i className="ri-file-list-line" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <i className="ri-pencil-line" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailForm && (
        <AdminPronosticDetailForm
          pronostic={detailForm}
          onClose={() => setDetailForm(null)}
          onSaved={loadItems}
        />
      )}
    </div>
  );
}
