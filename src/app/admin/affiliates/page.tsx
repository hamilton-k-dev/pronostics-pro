'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#F43F5E', '#0EA5E9', '#8B5CF6', '#EC4899'];

interface ClickRow {
  id: number;
  bookmaker_name: string;
  source_page: string;
  user_id: string;
  pronostic_id: number;
  clicked_at: string;
}

export default function AdminAffiliatesPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [totalClicks, setTotalClicks] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);
  const [weekClicks, setWeekClicks] = useState(0);
  const [byBookmaker, setByBookmaker] = useState<{ name: string; count: number }[]>([]);
  const [byPage, setByPage] = useState<{ page: string; count: number }[]>([]);
  const [byPronostic, setByPronostic] = useState<{ id: number; match_name: string; count: number }[]>([]);
  const [recentClicks, setRecentClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadStats();
  }, [admin, router]);

  async function loadStats() {
    setLoading(true);

    const { count: total } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true });
    setTotalClicks(total || 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: today } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('clicked_at', todayStart.toISOString());
    setTodayClicks(today || 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const { count: week } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('clicked_at', weekStart.toISOString());
    setWeekClicks(week || 0);

    const { data: bookmakerData } = await supabase
      .from('affiliate_clicks')
      .select('bookmaker_name');
    const bmMap: Record<string, number> = {};
    (bookmakerData || []).forEach((c) => {
      bmMap[c.bookmaker_name] = (bmMap[c.bookmaker_name] || 0) + 1;
    });
    setByBookmaker(
      Object.entries(bmMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );

    const { data: pageData } = await supabase
      .from('affiliate_clicks')
      .select('source_page');
    const pageMap: Record<string, number> = {};
    (pageData || []).forEach((c) => {
      const page = c.source_page || 'Inconnu';
      pageMap[page] = (pageMap[page] || 0) + 1;
    });
    setByPage(
      Object.entries(pageMap)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    );

    const { data: pronosticData } = await supabase
      .from('affiliate_clicks')
      .select('pronostic_id');
    const proMap: Record<string, number> = {};
    (pronosticData || []).forEach((c) => {
      if (c.pronostic_id) {
        proMap[String(c.pronostic_id)] = (proMap[String(c.pronostic_id)] || 0) + 1;
      }
    });
    const topProIds = Object.entries(proMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    if (topProIds.length > 0) {
      const { data: pronosticsData } = await supabase
        .from('pronostics')
        .select('id, match_name')
        .in('id', topProIds);
      const nameMap: Record<number, string> = {};
      (pronosticsData || []).forEach((p) => (nameMap[p.id] = p.match_name));
      setByPronostic(
        Object.entries(proMap)
          .map(([id, count]) => ({
            id: Number(id),
            match_name: nameMap[Number(id)] || `Pronostic #${id}`,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } else {
      setByPronostic([]);
    }

    const { data: recent } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .order('clicked_at', { ascending: false })
      .limit(10);
    setRecentClicks((recent as ClickRow[]) || []);

    setLoading(false);
  }

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Affiliation</h1>
        <p className="text-sm text-slate-500 mt-1">Suivi des clics sur les liens d&apos;affiliation</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Chargement des statistiques...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Clics total" value={totalClicks} icon="ri-cursor-line" color="text-indigo-600" bg="bg-indigo-50" />
            <SummaryCard label="Aujourd'hui" value={todayClicks} icon="ri-calendar-check-line" color="text-emerald-600" bg="bg-emerald-50" />
            <SummaryCard label="7 derniers jours" value={weekClicks} icon="ri-time-line" color="text-amber-600" bg="bg-amber-50" />
            <SummaryCard label="Bookmakers actifs" value={byBookmaker.length} icon="ri-briefcase-4-line" color="text-sky-600" bg="bg-sky-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Clics par bookmaker</h3>
              {byBookmaker.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun clic enregistré</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byBookmaker} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Bar dataKey="count" name="Clics" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Répartition par bookmaker</h3>
              {byBookmaker.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byBookmaker}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="name"
                        stroke="none"
                      >
                        {byBookmaker.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Clics par page source</h3>
              {byPage.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <div className="space-y-2">
                  {byPage.map((p) => (
                    <div key={p.page} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 truncate max-w-[200px]">{p.page}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((p.count / (byPage[0]?.count || 1)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Top pronostics (clics)</h3>
              {byPronostic.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun clic lié à un pronostic</p>
              ) : (
                <div className="space-y-2">
                  {byPronostic.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 truncate max-w-[240px]">{p.match_name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((p.count / (byPronostic[0]?.count || 1)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Clics récents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bookmaker</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Page source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Pronostic</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentClicks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">Aucun clic récent</td>
                    </tr>
                  ) : (
                    recentClicks.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-slate-900">{c.bookmaker_name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.source_page || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {c.pronostic_id ? (
                            <a href={`/pronostic/${c.pronostic_id}`} className="text-indigo-600 hover:underline">
                              Pronostic #{c.pronostic_id}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(c.clicked_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, color, bg }: { label: string; value: number; icon: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color}`}>
          <i className={icon} />
        </span>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
