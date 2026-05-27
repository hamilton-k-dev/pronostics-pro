'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'Comment fonctionnent les pronostics ?',
    a: "Nos experts analysent les statistiques, la forme des équipes, les blessures et les confrontations directes pour établir un pronostic avec un taux de confiance. Plus le taux est élevé, plus le pronostic est jugé fiable selon nos analyses.",
    category: 'Général',
  },
  {
    q: 'Les pronostics sont-ils gratuits ?',
    a: "Oui, tous nos pronostics du jour sont entièrement gratuits. Nous proposons également des analyses premium plus détaillées pour les abonnés, mais l'essentiel de nos prédictions reste accessible sans inscription.",
    category: 'Général',
  },
  {
    q: 'Comment suivre les scores en direct ?',
    a: 'Rendez-vous sur la page Scores pour consulter les résultats en temps réel de tous les matchs des ligues majeures. Vous pouvez filtrer par compétition et par date.',
    category: 'Scores',
  },
  {
    q: 'Puis-je recevoir des alertes pour mes matchs favoris ?',
    a: 'En vous connectant et en ajoutant des équipes à vos favoris, vous recevrez des notifications pour les pronostics et résultats associés. Cette fonctionnalité nécessite un compte gratuit.',
    category: 'Compte',
  },
  {
    q: "Qu'est-ce que le taux de confiance ?",
    a: "Le taux de confiance représente la probabilité estimée que le pronostic se réalise, basée sur nos modèles statistiques et l'expertise de nos analystes. Il est exprimé en pourcentage et s'accompagne d'une barre de progression colorée.",
    category: 'Pronostics',
  },
  {
    q: 'Comment créer un compte ?',
    a: "Cliquez sur \"S'inscrire\" dans le menu ou dans la section Connexion. Remplissez votre prénom, nom, email et choisissez un mot de passe. Vous pouvez également vous inscrire via Google en un clic.",
    category: 'Compte',
  },
  {
    q: "Puis-je voir l'historique des pronostics passés ?",
    a: 'Oui, chaque pronostic est suivi avec son résultat : Gagné, Perdu ou En cours. Vous pouvez consulter les résultats passés sur la page Pronostics en filtrant par statut.',
    category: 'Pronostics',
  },
  {
    q: 'Quels sports sont couverts ?',
    a: 'Nous couvrons principalement le football (Ligue 1, Premier League, La Liga, Serie A, Bundesliga, Ligue des Champions), le basketball (NBA) et le tennis (Roland Garros, Wimbledon). Nous élargissons régulièrement notre couverture.',
    category: 'Général',
  },
];

const CATEGORIES = ['Toutes', 'Général', 'Pronostics', 'Scores', 'Compte'];

export default function AidePage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeCat, setActiveCat] = useState('Toutes');
  const [search, setSearch] = useState('');

  let filtered = FAQS;
  if (activeCat !== 'Toutes') {
    filtered = filtered.filter((f) => f.category === activeCat);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Centre d&apos;aide</h1>
      <p className="text-sm text-slate-500 mb-6">Trouvez des réponses à vos questions sur Pronostics Pro</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
            <i className="ri-search-line" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une question..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
              activeCat === c
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-3">
        {filtered.map((faq, idx) => (
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

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="ri-question-line text-3xl" />
          </div>
          <p className="text-sm text-slate-500">Aucune question trouvée pour cette recherche.</p>
        </div>
      )}

      <div className="mt-10 bg-slate-50 rounded-xl p-6 max-w-3xl">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Vous ne trouvez pas de réponse ?</h2>
        <p className="text-sm text-slate-600 mb-4">
          Notre équipe est disponible pour vous aider. Utilisez le chat en bas à droite ou contactez-nous directement.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const btn = document.querySelector('#vapi-widget-floating-button');
              if (btn) (btn as HTMLElement).click();
            }}
            className="px-5 py-2.5 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
          >
            Discuter avec nous
          </button>
          <Link
            href="mailto:contact@pronosticspro.fr"
            className="text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors"
          >
            Envoyer un email
          </Link>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <form
          id="contact-aide"
          data-readdy-form
          action="https://readdy.ai/api/form/d7qdkkkdj3knvn2p25rg"
          method="POST"
          className="bg-white rounded-xl border border-slate-200 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const data = new URLSearchParams(fd as any);
            fetch(form.action, { method: 'POST', body: data, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
              .then(() => alert('Message envoyé !'))
              .catch(() => alert("Erreur lors de l'envoi."));
          }}
        >
          <h2 className="text-base font-semibold text-slate-900 mb-4">Envoyer un message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
              <input type="text" name="name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Votre nom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
              <textarea name="message" required maxLength={500} rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Décrivez votre question..." />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors">
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
