'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: 'ri-dashboard-line' },
  { href: '/admin/statistiques', label: 'Statistiques', icon: 'ri-bar-chart-box-line' },
  { href: '/admin/pronostics', label: 'Pronostics', icon: 'ri-football-line' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'ri-user-line' },
  { href: '/admin/commentaires', label: 'Commentaires', icon: 'ri-chat-3-line' },
  { href: '/admin/bookmakers', label: 'Bookmakers', icon: 'ri-briefcase-4-line' },
  { href: '/admin/affiliates', label: 'Affiliation', icon: 'ri-link-m' },
];

export default function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { admin, signOut } = useAdminAuth();

  if (!admin) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
    router.push('/admin/connexion');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40">
        <div className="p-5 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-indigo-700 rounded-lg text-white">
              <i className="ri-shield-user-line" />
            </span>
            <span className="font-['Pacifico'] text-lg text-indigo-900">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center"><i className={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{admin.name}</p>
              <p className="text-xs text-slate-400 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line" /></span>
            Déconnexion
          </button>
          <a
            href="/"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors mt-1"
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line" /></span>
            Retour au site
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-7 h-7 flex items-center justify-center bg-indigo-700 rounded text-white text-xs">
            <i className="ri-shield-user-line" />
          </span>
          <span className="font-['Pacifico'] text-base text-indigo-900">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="w-8 h-8 flex items-center justify-center text-rose-500"
          >
            <i className="ri-logout-box-r-line" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 flex items-center justify-center text-slate-600"
          >
            <i className={mobileOpen ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-white border-b border-slate-200 z-30 p-3 space-y-1 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center"><i className={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span className="w-5 h-5 flex items-center justify-center"><i className="ri-arrow-left-line" /></span>
            Retour au site
          </a>
        </div>
      )}
    </>
  );
}
