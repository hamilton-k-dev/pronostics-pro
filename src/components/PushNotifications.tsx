'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface NotificationItem {
  id: number;
  match: string;
  subtitle: string;
  type: 'new' | 'win' | 'loss';
  time: string;
}

export default function PushNotifications() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [enabled, setEnabled] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission as 'default' | 'granted' | 'denied');
      const saved = localStorage.getItem('pronostics_notifications');
      if (saved === 'true') setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase
      .channel('new-pronostics')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pronostics' },
        (payload) => {
          const newPronostic = payload.new as any;
          const notif: NotificationItem = {
            id: Date.now(),
            match: newPronostic.match_name || 'Nouveau pronostic',
            subtitle: `${newPronostic.league} — ${newPronostic.prediction} (Cote ${Number(newPronostic.odds).toFixed(2)})`,
            type: 'new',
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          };

          setNotifications((prev) => [notif, ...prev].slice(0, 5));

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouveau pronostic disponible', {
              body: `${notif.match} — ${notif.subtitle}`,
              icon: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setEnabled(true);
      localStorage.setItem('pronostics_notifications', 'true');
    }
  };

  const toggleEnabled = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('pronostics_notifications', String(newValue));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs">
        {notifications.map((n) => {
          const notifStyles =
            n.type === 'new'
              ? { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', icon: 'ri-football-line' }
              : n.type === 'win'
              ? { bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', icon: 'ri-checkbox-circle-line' }
              : { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', icon: 'ri-close-circle-line' };

          return (
            <div
              key={n.id}
              className={`rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${notifStyles.bg} ${notifStyles.border}`}
            >
              <span className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${notifStyles.iconBg} ${notifStyles.iconColor}`}>
                <i className={notifStyles.icon} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{n.match}</p>
                <p className={`text-xs ${n.type === 'new' ? 'text-indigo-700' : n.type === 'win' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {n.subtitle}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 shrink-0"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          );
        })}
      </div>

      {permission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-indigo-700 text-white shadow-lg flex items-center justify-center hover:bg-indigo-800 transition-colors"
          title="Activer les notifications"
        >
          <span className="w-5 h-5 flex items-center justify-center"><i className="ri-notification-3-line" /></span>
        </button>
      )}

      {permission === 'granted' && (
        <button
          onClick={toggleEnabled}
          className={`fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-400 text-white hover:bg-slate-500'
          }`}
          title={enabled ? 'Désactiver les notifications' : 'Activer les notifications'}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <i className={enabled ? 'ri-notification-3-fill' : 'ri-notification-off-line'} />
          </span>
        </button>
      )}
    </>
  );
}
