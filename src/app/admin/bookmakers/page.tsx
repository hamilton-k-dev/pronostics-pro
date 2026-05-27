'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';

interface Bookmaker {
  id: number;
  name: string;
  url: string;
  bonus: string;
  description: string;
  logo_url: string;
  featured: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export default function AdminBookmakersPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [items, setItems] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bookmaker | null>(null);

  const [form, setForm] = useState({
    name: '',
    url: '',
    bonus: '',
    description: '',
    logo_url: '',
    featured: false,
    sort_order: 1,
    active: true,
  });

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadItems();
  }, [admin, router]);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase
      .from('affiliate_bookmakers')
      .select('*')
      .order('sort_order', { ascending: true });
    setItems((data as Bookmaker[]) || []);
    setLoading(false);
  }

  function resetForm() {
    setForm({
      name: '',
      url: '',
      bonus: '',
      description: '',
      logo_url: '',
      featured: false,
      sort_order: 1,
      active: true,
    });
    setEditing(null);
  }

  function openEdit(b: Bookmaker) {
    setEditing(b);
    setForm({
      name: b.name,
      url: b.url,
      bonus: b.bonus || '',
      description: b.description || '',
      logo_url: b.logo_url || '',
      featured: b.featured,
      sort_order: b.sort_order,
      active: b.active,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) return;
    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      bonus: form.bonus.trim() || null,
      description: form.description.trim() || null,
      logo_url: form.logo_url.trim() || null,
      featured: form.featured,
      sort_order: Number(form.sort_order),
      active: form.active,
    };

    if (editing) {
      await supabase.from('affiliate_bookmakers').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('affiliate_bookmakers').insert(payload);
    }
    setShowForm(false);
    resetForm();
    loadItems();
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce bookmaker ?')) return;
    await supabase.from('affiliate_bookmakers').delete().eq('id', id);
    loadItems();
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('affiliate_bookmakers').update({ active: !current }).eq('id', id);
    loadItems();
  }

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des bookmakers</h1>
          <p className="text-sm text-slate-500 mt-1">Créer, modifier et organiser les partenaires d&apos;affiliation</p>
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
        >
          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></span>
          Nouveau partenaire
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {editing ? 'Modifier le bookmaker' : 'Nouveau bookmaker'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Winamax"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">URL d&apos;affiliation</label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://www.winamax.fr"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bonus / Offre</label>
              <input
                type="text"
                value={form.bonus}
                onChange={(e) => setForm((f) => ({ ...f, bonus: e.target.value }))}
                placeholder="100€ de bonus"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ordre d&apos;affichage</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Plateforme leader des paris sportifs en France..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Partenaire officiel (mis en avant)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Actif</span>
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
              >
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ordre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">URL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Chargement...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Aucun bookmaker</td>
                </tr>
              ) : (
                items.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500">{b.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{b.name}</p>
                        {b.featured && (
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-amber-500"><i className="ri-star-fill text-xs" /></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{b.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate max-w-[200px] block">
                        {b.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700">{b.bonus || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(b.id, b.active)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          b.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {b.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <i className="ri-pencil-line" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
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
    </div>
  );
}
