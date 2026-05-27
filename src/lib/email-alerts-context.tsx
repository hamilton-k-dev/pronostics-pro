'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface EmailAlert {
  id: number;
  sport: string;
  minConfidence: number;
  maxOdds: number;
  active: boolean;
}

interface EmailAlertContextType {
  alerts: EmailAlert[];
  addAlert: (sport: string, minConfidence: number, maxOdds: number) => void;
  removeAlert: (id: number) => void;
  toggleAlert: (id: number) => void;
  hasActiveAlerts: boolean;
}

const EmailAlertContext = createContext<EmailAlertContextType | undefined>(undefined);

export function EmailAlertProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const userKey = user?.id ?? 'guest';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`email_alerts_${userKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAlerts(parsed.map((a: any) => ({ ...a, active: a.active !== false })));
      } catch {
        setAlerts([]);
      }
    }
    setLoaded(true);
  }, [userKey]);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    localStorage.setItem(`email_alerts_${userKey}`, JSON.stringify(alerts));
  }, [alerts, userKey, loaded]);

  const addAlert = (sport: string, minConfidence: number, maxOdds: number) => {
    const newAlert: EmailAlert = {
      id: Date.now(),
      sport,
      minConfidence,
      maxOdds,
      active: true,
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const hasActiveAlerts = alerts.some((a) => a.active);

  return (
    <EmailAlertContext.Provider
      value={{ alerts, addAlert, removeAlert, toggleAlert, hasActiveAlerts }}
    >
      {children}
    </EmailAlertContext.Provider>
  );
}

export function useEmailAlerts() {
  const ctx = useContext(EmailAlertContext);
  if (!ctx) throw new Error('useEmailAlerts must be used within EmailAlertProvider');
  return ctx;
}
