'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OddsHistoryEntry {
  id: number;
  pronostic_id: number;
  bookmaker_name: string;
  odds: number;
  recorded_at: string;
}

export default function OddsHistoryChart({
  pronosticId,
}: {
  pronosticId: number;
}) {
  const [history, setHistory] = useState<OddsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from('odds_history')
        .select('*')
        .eq('pronostic_id', pronosticId)
        .order('recorded_at', { ascending: true })
        .limit(100);
      if (data) setHistory(data as OddsHistoryEntry[]);
      setLoading(false);
    }
    loadHistory();
  }, [pronosticId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-line-chart-line" /></span>
          <h2 className="text-sm font-semibold text-slate-900">Évolution des cotes</h2>
        </div>
        <div className="px-5 py-8 text-center text-sm text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  const bookmakers = Array.from(new Set(history.map((h) => h.bookmaker_name)));
  const colors = ['#14B8A6', '#6366F1', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];

  const groupedByTime: Record<string, Record<string, number | null>> = {};
  history.forEach((entry) => {
    const timeKey = new Date(entry.recorded_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (!groupedByTime[timeKey]) groupedByTime[timeKey] = {};
    groupedByTime[timeKey][entry.bookmaker_name] = entry.odds;
  });

  const chartData = Object.entries(groupedByTime).map(([date, values]) => ({
    date,
    ...values,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-line-chart-line" /></span>
        <h2 className="text-sm font-semibold text-slate-900">Évolution des cotes</h2>
        <span className="ml-auto text-[10px] text-slate-400">
          {history.length} points de données
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => v.toFixed(2)}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Cote']}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              {bookmakers.map((bm, i) => (
                <Area
                  key={bm}
                  type="monotone"
                  dataKey={bm}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name={bm}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex flex-wrap gap-3">
          {bookmakers.map((bm, i) => {
            const bmHistory = history.filter((h) => h.bookmaker_name === bm);
            const first = bmHistory[0]?.odds;
            const last = bmHistory[bmHistory.length - 1]?.odds;
            const evolution = first && last ? (((last - first) / first) * 100).toFixed(1) : null;
            const isUp = evolution !== null && Number(evolution) > 0;
            const isDown = evolution !== null && Number(evolution) < 0;

            return (
              <div key={bm} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-xs font-medium text-slate-700">{bm}</span>
                {evolution !== null && (
                  <span className={`text-[10px] font-medium ${isUp ? 'text-rose-500' : isDown ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isUp ? '+' : ''}{evolution}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
