import Link from 'next/link';
import Image from 'next/image';
import BookmakerBanner from './BookmakerBanner';

const FOOTER_LINKS = [
  { href: '/recherche', label: 'Recherche' },
  { href: '/pronostics', label: 'Pronostics' },
  { href: '/scores', label: 'Scores' },
  { href: '/bookmakers', label: 'Bookmakers' },
  { href: '/aide', label: 'Aide' },
];

export default function Footer() {
  return (
    <>
      <BookmakerBanner />
      <footer className="w-full bg-slate-900 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="https://public.readdy.ai/ai/img_res/c2c7cf6d-8df5-4274-9c34-49ab3e7a6351.png"
                  alt="Pronostics Pro"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-['Pacifico'] text-lg">Pronostics Pro</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                La plateforme de pronostics sportifs la plus fiable en France. Analyses expertes, scores en direct et communauté passionnée.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Navigation</h4>
              <ul className="flex flex-col gap-2">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Contact</h4>
              <p className="text-sm text-slate-400">contact@pronosticspro.fr</p>
              <p className="text-sm text-slate-400 mt-1">Paris, France</p>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 text-center">
            <p className="text-xs text-slate-500">
              © 2025 Pronostics Pro. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
