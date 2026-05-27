'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pronostics_admin');
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        localStorage.removeItem('pronostics_admin');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));
    if (email === 'admin@pronosticspro.com' && password === 'admin123') {
      const u: AdminUser = { id: 'admin_001', email, name: 'Administrateur' };
      setAdmin(u);
      localStorage.setItem('pronostics_admin', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('pronostics_admin');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
