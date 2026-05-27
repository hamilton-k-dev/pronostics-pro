'use client';

import { useState } from 'react';

interface SocialShareProps {
  match: string;
  prediction: string;
  odds: string;
  confidence: number;
  pronosticId: string;
}

export default function SocialShare({ match, prediction, odds, confidence, pronosticId }: SocialShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `Mon pronostic du jour : ${match} — ${prediction} à ${odds} (${confidence}% confiance) via Pronostics Pro`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/pronostic/${pronosticId}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = `${shareText} ${shareUrl}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: 'X / Twitter',
      icon: 'ri-twitter-x-line',
      color: 'hover:bg-slate-900 hover:text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: 'ri-facebook-fill',
      color: 'hover:bg-blue-600 hover:text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'WhatsApp',
      icon: 'ri-whatsapp-line',
      color: 'hover:bg-emerald-500 hover:text-white',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
      >
        <i className="ri-share-line" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden py-2">
            <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Partager</p>
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors ${link.color}`}
                onClick={() => setOpen(false)}
              >
                <span className="w-5 h-5 flex items-center justify-center"><i className={link.icon} /></span>
                {link.name}
              </a>
            ))}
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
            >
              <span className="w-5 h-5 flex items-center justify-center"><i className={copied ? 'ri-check-line' : 'ri-link'} /></span>
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
