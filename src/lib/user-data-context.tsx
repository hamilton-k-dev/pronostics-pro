'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface FollowedPronostic {
  id: number;
  pronosticId: number;
  match: string;
  prediction: string;
  odds: number;
  confidence: number;
  result: string;
  followedAt: string;
}

interface FavoritePronostic {
  id: number;
  match: string;
  prediction: string;
  odds: number;
  confidence: number;
  addedAt: string;
}

interface UserDataContextType {
  favorites: FavoritePronostic[];
  history: FollowedPronostic[];
  toggleFavorite: (id: number, match: string, prediction: string, odds: number, confidence: number) => void;
  isFavorite: (id: number) => boolean;
  addToHistory: (id: number, match: string, prediction: string, odds: number, confidence: number, result: string) => void;
  removeFromHistory: (id: number) => void;
  isInHistory: (id: number) => boolean;
  stats: { total: number; wins: number; losses: number; winRate: number; profit: number };
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoritePronostic[]>([]);
  const [history, setHistory] = useState<FollowedPronostic[]>([]);

  const userKey = user?.id ?? 'guest';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fav = localStorage.getItem(`favorites_${userKey}`);
    const hist = localStorage.getItem(`history_${userKey}`);
    if (fav) setFavorites(JSON.parse(fav));
    if (hist) setHistory(JSON.parse(hist));
  }, [userKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`favorites_${userKey}`, JSON.stringify(favorites));
  }, [favorites, userKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`history_${userKey}`, JSON.stringify(history));
  }, [history, userKey]);

  const toggleFavorite = (id: number, match: string, prediction: string, odds: number, confidence: number) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === id);
      if (exists) return prev.filter((f) => f.id !== id);
      return [...prev, { id, match, prediction, odds, confidence, addedAt: new Date().toISOString() }];
    });
  };

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  const addToHistory = (id: number, match: string, prediction: string, odds: number, confidence: number, result: string) => {
    setHistory((prev) => {
      const exists = prev.find((h) => h.pronosticId === id);
      if (exists) {
        return prev.map((h) => (h.pronosticId === id ? { ...h, result } : h));
      }
      return [...prev, { id: Date.now(), pronosticId: id, match, prediction, odds, confidence, result, followedAt: new Date().toISOString() }];
    });
  };

  const removeFromHistory = (id: number) => {
    setHistory((prev) => prev.filter((h) => h.pronosticId !== id));
  };

  const isInHistory = (id: number) => history.some((h) => h.pronosticId === id);

  const stats = (() => {
    const total = history.length;
    const wins = history.filter((h) => h.result === 'Gagné').length;
    const losses = history.filter((h) => h.result === 'Perdu').length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const profit = history.reduce((acc, h) => {
      if (h.result === 'Gagné') return acc + (h.odds - 1) * 10;
      if (h.result === 'Perdu') return acc - 10;
      return acc;
    }, 0);
    return { total, wins, losses, winRate, profit };
  })();

  return (
    <UserDataContext.Provider value={{ favorites, history, toggleFavorite, isFavorite, addToHistory, removeFromHistory, isInHistory, stats }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
