'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: number;
  pronostic_id: number;
  user_name: string;
  user_email: string | null;
  content: string;
  created_at: string;
  parent_id?: number | null;
  is_admin?: boolean;
  flagged?: boolean;
}

export default function PronosticComments({ pronosticId }: { pronosticId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadComments();
  }, [pronosticId]);

  async function loadComments() {
    setLoading(true);
    const { data } = await supabase
      .from('pronostic_comments')
      .select('*')
      .eq('pronostic_id', pronosticId)
      .order('created_at', { ascending: false });
    if (data) setComments((data as Comment[]).filter((c) => !c.flagged));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    if (content.length > 500) return;
    setSubmitting(true);
    await supabase.from('pronostic_comments').insert({
      pronostic_id: Number(pronosticId),
      user_name: name.trim(),
      user_email: email.trim() || null,
      content: content.trim(),
    });
    setContent('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    loadComments();
    setSubmitting(false);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const rootComments = comments.filter((c) => !c.parent_id);
  const repliesMap = comments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<number, Comment[]>);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center text-indigo-600">
          <i className="ri-chat-3-line" />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">Commentaires ({comments.length})</h2>
      </div>

      <div className="px-5 py-4">
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pseudo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre pseudo"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email (optionnel)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre avis sur ce pronostic..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
            <p className={`text-xs mt-1 ${content.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
              {content.length}/500 caractères
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !name.trim() || !content.trim()}
              className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? 'Envoi...' : 'Publier'}
            </button>
            {success && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line" /></span>
                Commentaire publié
              </span>
            )}
          </div>
        </form>

        {loading ? (
          <div className="text-center py-6">
            <div className="w-6 h-6 mx-auto mb-2 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Chargement des commentaires...</p>
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8">
            <span className="w-10 h-10 flex items-center justify-center mx-auto mb-2 text-slate-300">
              <i className="ri-chat-off-line text-xl" />
            </span>
            <p className="text-sm text-slate-500">Aucun commentaire pour le moment.</p>
            <p className="text-xs text-slate-400 mt-1">Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          <div className="space-y-0">
            {rootComments.map((c) => {
              const replies = repliesMap[c.id] || [];
              return (
                <div key={c.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {c.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{c.user_name}</span>
                        <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
                    </div>
                  </div>

                  {replies.length > 0 && (
                    <div className="pl-10 mt-2 space-y-2">
                      {replies.map((r) => (
                        <div key={r.id} className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0 mt-0.5">
                            <i className="ri-shield-user-line" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-900">{r.user_name}</span>
                              {r.is_admin && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Admin</span>
                              )}
                              <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
