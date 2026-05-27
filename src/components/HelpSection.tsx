'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'Comment fonctionnent les pronostics ?',
    a: 'Nos experts analysent les statistiques, la forme des équipes, les blessures et les confrontations directes pour établir un pronostic avec un taux de confiance.',
  },
  {
    q: 'Les pronostics sont-ils gratuits ?',
    a: 'Oui, tous nos pronostics du jour sont entièrement gratuits. Nous proposons également des analyses premium plus détaillées pour les abonnés.',
  },
  {
    q: 'Comment suivre les scores en direct ?',
    a: 'Rendez-vous sur la page Scores pour consulter les résultats en temps réel de tous les matchs des ligues majeures.',
  },
  {
    q: 'Puis-je recevoir des alertes pour mes matchs favoris ?',
    a: 'En vous connectant et en ajoutant des équipes à vos favoris, vous recevrez des notifications pour les pronostics et résultats associés.',
  },
];

export default function HelpSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-14">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Besoin d'aide ?</h2>
          <p className="text-sm text-slate-500 mt-2">Réponses aux questions les plus fréquentes</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="text-sm font-medium text-slate-900">{faq.q}</span>
                <div className="w-5 h-5 flex items-center justify-center text-slate-400 shrink-0">
                  <i className={openIdx === idx ? 'ri-arrow-up-s-line text-lg' : 'ri-arrow-down-s-line text-lg'} />
                </div>
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/aide"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-customer-service-line" />
            </div>
            Consulter le centre d'aide complet
          </Link>
        </div>
      </div>
    </section>
  );
}
