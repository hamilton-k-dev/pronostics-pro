'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';

interface UserPronostic {
  id: number;
  user_id: string;
  match_id: string;
  prediction: string;
  odds: number;
  result: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserPronostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadUsers();
  }, [admin, router]);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from('user_pronostics').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  const userMap = users.reduce((acc, u) => {
    if (!acc[u.user_id]) acc[u.user_id] = [];
    acc[u.user_id].push(u);
    return acc;
  }, {} as Record<string, UserPronostic[]>);

  const userList = Object.entries(userMap).map(([uid, items]) => {
    const wins = items.filter((i) => i.result === 'Gagné').length;
    const losses = items.filter((i) => i.result === 'Perdu').length;
    const total = items.length;
    return { userId: uid, total, wins, losses, winRate: total > 0 ? Math.round((wins / total) * 100) : 0, items };
  });

  const filtered = userList.filter((u) => u.userId.toLowerCase().includes(filter.toLowerCase()));

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-sm text-slate-500 mt-1">Historique des utilisateurs et leurs pronostics suivis</p>
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
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Pronostics suivis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Gagnés</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Perdus</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Taux</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Derniers pronostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {u.userId.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 text-xs">{u.userId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.total}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{u.wins}</td>
                    <td className="px-4 py-3 text-rose-500 font-medium">{u.losses}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        u.winRate >= 60 ? 'bg-emerald-50 text-emerald-700' : u.winRate >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.winRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {u.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-xs text-slate-500 truncate max-w-[180px]">
                            {item.prediction} — {item.result}
                          </span>
                        ))}
                        {u.items.length > 2 && (
                          <span className="text-xs text-slate-400">+{u.items.length - 2} autres</span>
                        )}
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
