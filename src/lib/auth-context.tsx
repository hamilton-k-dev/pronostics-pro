'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pronostics_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('pronostics_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: 'usr_' + Math.random().toString(36).slice(2, 10),
      email,
      name: email.split('@')[0],
    };
    setUser(u);
    localStorage.setItem('pronostics_user', JSON.stringify(u));
  };

  const signUp = async (email: string, password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: User = {
      id: 'usr_' + Math.random().toString(36).slice(2, 10),
      email,
      name,
    };
    setUser(u);
    localStorage.setItem('pronostics_user', JSON.stringify(u));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('pronostics_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
