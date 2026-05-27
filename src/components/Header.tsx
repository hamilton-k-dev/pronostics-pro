'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useAdminAuth } from '@/lib/admin-auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/recherche', label: 'Recherche' },
  { href: '/pronostics', label: 'Pronostics' },
  { href: '/scores', label: 'Scores' },
  { href: '/bookmakers', label: 'Bookmakers' },
  { href: '/aide', label: 'Aide' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { admin, signOut: adminSignOut } = useAdminAuth();

  return (
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://public.readdy.ai/ai/img_res/c2c7cf6d-8df5-4274-9c34-49ab3e7a6351.png"
              alt="Pronostics Pro"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-['Pacifico'] text-xl text-indigo-900">Pronostics Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {admin ? (
              <Link
                href="/admin"
                className="text-sm font-medium px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-user-line" /></span>
                Admin
              </Link>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <span className="w-4 h-4 flex items-center justify-center text-slate-400">
                    <i className={accountOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                  </span>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden py-1">
                    <Link
                      href="/compte/tableau-de-bord"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setAccountOpen(false)}
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-dashboard-line" /></span>
                      Tableau de bord
                    </Link>
                    <button
                      onClick={() => { signOut(); setAccountOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line" /></span>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-medium text-slate-600 hover:text-indigo-700 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/connexion"
                  className="text-sm font-medium px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i className={mobileOpen ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              {admin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-slate-700 py-2 flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-user-line" /></span>
                  Panel Admin
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/compte/tableau-de-bord"
                    className="text-sm font-medium text-slate-700 py-2 flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-dashboard-line" /></span>
                    Tableau de bord
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="text-sm font-medium text-rose-600 py-2 text-left flex items-center gap-2"
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line" /></span>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    className="text-sm font-medium text-slate-600 py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/connexion"
                    className="text-sm font-medium px-4 py-2 bg-indigo-700 text-white rounded-lg text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
