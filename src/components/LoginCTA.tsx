'use client';

import Link from 'next/link';

export default function LoginCTA() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-14">
      <div className="bg-indigo-700 rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Rejoignez 50 000 parieurs
        </h2>
        <p className="text-base text-indigo-200 mb-8 max-w-xl mx-auto">
          Créez un compte gratuit pour accéder à tous les pronostics, suivre vos favoris et recevoir des alertes personnalisées.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/connexion"
            className="px-8 py-3 bg-white text-indigo-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Se connecter
          </Link>
          <Link
            href="/connexion"
            className="px-8 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap"
          >
            Créer un compte gratuit
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-indigo-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-check-line" />
            </div>
            Pronostics gratuits
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-check-line" />
            </div>
            Alertes personnalisées
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-check-line" />
            </div>
            Scores en direct
          </div>
        </div>
      </div>
    </section>
  );
}
