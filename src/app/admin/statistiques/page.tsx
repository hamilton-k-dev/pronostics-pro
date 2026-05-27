'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface Pronostic {
  id: number;
  league: string;
  match_name: string;
  prediction: string;
  confidence: number;
  odds: number;
  result: string;
  created_at: string;
}

const COLORS = {
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B',
  indigo: '#6366F1',
  sky: '#0EA5E9',
  slate: '#94A3B8',
};

export default function AdminStatistiquesPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [pronostics, setPronostics] = useState<Pronostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadData();
  }, [admin, router]);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('pronostics')
      .select('id, league, match_name, prediction, confidence, odds, result, created_at')
      .order('created_at', { ascending: false });
    setPronostics((data as Pronostic[]) || []);
    setLoading(false);
  }

  const total = pronostics.length;
  const wins = pronostics.filter((p) => p.result === 'Gagné').length;
  const losses = pronostics.filter((p) => p.result === 'Perdu').length;
  const pending = pronostics.filter((p) => p.result === 'En attente' || p.result === 'En cours').length;
  const settled = wins + losses;
  const winRate = settled > 0 ? Math.round((wins / settled) * 100) : 0;

  const avgOddsWin =
    pronostics.filter((p) => p.result === 'Gagné').length > 0
      ? (
          pronostics.filter((p) => p.result === 'Gagné').reduce((s, p) => s + Number(p.odds), 0) /
          pronostics.filter((p) => p.result === 'Gagné').length
        ).toFixed(2)
      : '0.00';

  const avgOddsLoss =
    pronostics.filter((p) => p.result === 'Perdu').length > 0
      ? (
          pronostics.filter((p) => p.result === 'Perdu').reduce((s, p) => s + Number(p.odds), 0) /
          pronostics.filter((p) => p.result === 'Perdu').length
        ).toFixed(2)
      : '0.00';

  const pieData = [
    { name: 'Gagnés', value: wins, color: COLORS.emerald },
    { name: 'Perdus', value: losses, color: COLORS.rose },
    { name: 'En attente', value: pending, color: COLORS.amber },
  ].filter((d) => d.value > 0);

  const leagueMap = pronostics.reduce((acc, p) => {
    if (!acc[p.league]) acc[p.league] = { name: p.league, total: 0, wins: 0, losses: 0 };
    acc[p.league].total++;
    if (p.result === 'Gagné') acc[p.league].wins++;
    if (p.result === 'Perdu') acc[p.league].losses++;
    return acc;
  }, {} as Record<string, { name: string; total: number; wins: number; losses: number }>);
  const leagueData = Object.values(leagueMap)
    .map((l) => ({ ...l, winRate: l.wins + l.losses > 0 ? Math.round((l.wins / (l.wins + l.losses)) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);

  const monthMap = pronostics.reduce((acc, p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { month: key, wins: 0, losses: 0, total: 0 };
    acc[key].total++;
    if (p.result === 'Gagné') acc[key].wins++;
    if (p.result === 'Perdu') acc[key].losses++;
    return acc;
  }, {} as Record<string, { month: string; wins: number; losses: number; total: number }>);
  const monthData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  const confBrackets = [
    { label: '80-100%', min: 80, max: 100 },
    { label: '70-79%', min: 70, max: 79 },
    { label: '60-69%', min: 60, max: 69 },
    { label: '50-59%', min: 50, max: 59 },
    { label: '<50%', min: 0, max: 49 },
  ];
  const confData = confBrackets.map((b) => {
    const subset = pronostics.filter((p) => p.confidence >= b.min && p.confidence <= b.max && (p.result === 'Gagné' || p.result === 'Perdu'));
    const w = subset.filter((p) => p.result === 'Gagné').length;
    const l = subset.filter((p) => p.result === 'Perdu').length;
    return { name: b.label, wins: w, losses: l, total: w + l, winRate: w + l > 0 ? Math.round((w / (w + l)) * 100) : 0 };
  }).filter((d) => d.total > 0);

  const bestLeague =
    leagueData.length > 0
      ? leagueData.reduce((best, curr) => (curr.winRate > best.winRate && curr.total >= 3 ? curr : best), leagueData[0])
      : null;

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Statistiques globales</h1>
        <p className="text-sm text-slate-500 mt-1">Performance et tendances de tous les pronostics</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Chargement des statistiques...</p>
        </div>
      ) : total === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-300">
            <i className="ri-bar-chart-box-line text-2xl" />
          </span>
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Aucune donnée</h2>
          <p className="text-xs text-slate-500">Créez des pronostics pour voir les statistiques apparaître ici.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Total pronostics" value={total} icon="ri-football-line" color="text-indigo-600" bg="bg-indigo-50" />
            <SummaryCard label="Taux de réussite" value={`${winRate}%`} icon="ri-percent-line" color="text-emerald-600" bg="bg-emerald-50" />
            <SummaryCard label="Gagnés / Perdus" value={`${wins} / ${losses}`} icon="ri-exchange-line" color="text-sky-600" bg="bg-sky-50" />
            <SummaryCard label="En attente" value={pending} icon="ri-time-line" color="text-amber-600" bg="bg-amber-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Évolution mensuelle</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                      labelStyle={{ color: '#0F172A', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="wins" name="Gagnés" stroke={COLORS.emerald} fill="url(#winGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="losses" name="Perdus" stroke={COLORS.rose} fill="url(#lossGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Répartition des résultats</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Performance par ligue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leagueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="wins" name="Gagnés" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" name="Perdus" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Taux de réussite par ligue (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leagueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                      formatter={(value) => [`${value}%`, 'Taux de réussite']}
                    />
                    <Bar dataKey="winRate" name="% Réussite" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Réussite par niveau de confiance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="wins" name="Gagnés" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" name="Perdus" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Cotes moyennes</h3>
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="flex items-end gap-8">
                  <div className="text-center">
                    <div className="w-16 h-32 bg-emerald-100 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-lg font-bold text-emerald-700">{avgOddsWin}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-2">Cote moyenne gagnée</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-32 bg-rose-100 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-lg font-bold text-rose-700">{avgOddsLoss}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-2">Cote moyenne perdue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-2">Meilleure ligue</p>
              <p className="text-lg font-bold text-slate-900">{bestLeague ? bestLeague.name : '—'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {bestLeague ? `${bestLeague.winRate}% sur ${bestLeague.total} pronostics` : 'Minimum 3 pronostics requis'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-2">Confiance moyenne</p>
              <p className="text-lg font-bold text-slate-900">
                {total > 0 ? Math.round(pronostics.reduce((s, p) => s + p.confidence, 0) / total) : 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">Sur l&apos;ensemble des pronostics</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 mb-2">Cote moyenne globale</p>
              <p className="text-lg font-bold text-slate-900">
                {total > 0 ? (pronostics.reduce((s, p) => s + Number(p.odds), 0) / total).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tous pronostics confondus</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
}) {
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
