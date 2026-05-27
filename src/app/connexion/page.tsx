'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ConnexionPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, `${firstName} ${lastName}`.trim() || email.split('@')[0]);
      }
      router.push('/compte/tableau-de-bord');
    } catch {
      // silent
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="https://public.readdy.ai/ai/img_res/c2c7cf6d-8df5-4274-9c34-49ab3e7a6351.png"
              alt="Pronostics Pro"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-['Pacifico'] text-xl text-indigo-900">Pronostics Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin
              ? 'Connectez-vous pour accéder à vos pronostics'
              : 'Inscrivez-vous gratuitement pour rejoindre la communauté'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-full">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                isLogin ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                !isLogin ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="jean.dupont@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Min. 8 caractères"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-500" />
                  <span className="text-xs text-slate-600">Se souvenir de moi</span>
                </label>
                <button type="button" className="text-xs font-medium text-indigo-700 hover:text-indigo-800">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "Créer un compte"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">ou</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-google-fill text-base" />
            </div>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
}
