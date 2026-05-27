'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn as baSignIn, signOut as baSignOut, signUp as baSignUp } from '@/lib/auth-client';

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
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? session.user.email.split('@')[0],
      }
    : null;

  const signIn = async (email: string, password: string) => {
    const { error } = await baSignIn.email({ email, password });
    if (error) throw new Error(error.message ?? 'Identifiants incorrects');
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await baSignUp.email({ email, password, name });
    if (error) throw new Error(error.message ?? 'Erreur lors de la création du compte');
  };

  const signOut = () => {
    baSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isPending, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
