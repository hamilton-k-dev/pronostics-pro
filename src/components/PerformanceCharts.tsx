'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useUserData } from '@/lib/user-data-context';

export function WinRatePie({
  wins,
  losses,
  total,
  winRate,
  profit,
}: {
  wins: number;
  losses: number;
  total: number;
  winRate: number;
  profit: number;
}) {
  const pending = total - wins - losses;
  const data = [
    { name: 'Gagnés', value: wins, color: '#10B981' },
    { name: 'Perdus', value: losses, color: '#EF4444' },
    { name: 'En cours', value: pending > 0 ? pending : 0, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-300">
        <div className="text-center">
          <i className="ri-pie-chart-line text-3xl" />
          <p className="text-xs mt-1 text-slate-400">Aucune donnée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
            formatter={(value) => [value, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{winRate}%</p>
          <p className="text-[10px] text-slate-400">réussite</p>
        </div>
      </div>
    </div>
  );
}

export function MonthlyProfitChart() {
  const { history } = useUserData();

  const monthlyData: Record<string, number> = {};
  history.forEach((h) => {
    const month = new Date(h.followedAt).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) monthlyData[month] = 0;
    if (h.result === 'Gagné') monthlyData[month] += (h.odds - 1) * 10;
    else if (h.result === 'Perdu') monthlyData[month] -= 10;
  });

  const chartData = Object.entries(monthlyData).map(([month, profit]) => ({
    month,
    profit: parseFloat(profit.toFixed(1)),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-300">
        <div className="text-center">
          <i className="ri-bar-chart-line text-2xl" />
          <p className="text-xs mt-1 text-slate-400">Aucune donnée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
            formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value} €`, 'Profit']}
          />
          <Bar dataKey="profit" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StreakChart() {
  const { history } = useUserData();

  const last10 = [...history]
    .sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime())
    .slice(0, 10)
    .reverse();

  if (last10.length === 0) {
    return (
      <div className="flex items-center justify-center h-12 text-slate-300">
        <p className="text-xs text-slate-400">Aucune donnée</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {last10.map((h, i) => {
        const color =
          h.result === 'Gagné' ? 'bg-emerald-500' :
          h.result === 'Perdu' ? 'bg-rose-500' :
          'bg-amber-400';
        return (
          <div
            key={i}
            className={`flex-1 h-8 rounded ${color} flex items-center justify-center`}
            title={`${h.match} — ${h.result}`}
          >
            <span className="text-white text-[10px] font-bold">
              {h.result === 'Gagné' ? 'W' : h.result === 'Perdu' ? 'L' : 'D'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
