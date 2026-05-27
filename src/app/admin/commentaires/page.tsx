'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

interface PronosticLite {
  id: number;
  match_name: string;
  league: string;
}

export default function AdminCommentairesPage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pronostics, setPronostics] = useState<Record<number, PronosticLite>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged'>('all');
  const [togglingFlag, setTogglingFlag] = useState<number | null>(null);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/connexion');
      return;
    }
    loadData();
  }, [admin, router]);

  async function loadData() {
    setLoading(true);
    const { data: commentsData } = await supabase
      .from('pronostic_comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (commentsData) {
      setComments(commentsData as Comment[]);

      const ids = [...new Set((commentsData as Comment[]).map((c) => c.pronostic_id))];
      if (ids.length > 0) {
        const { data: proData } = await supabase
          .from('pronostics')
          .select('id, match_name, league')
          .in('id', ids);
        if (proData) {
          const map: Record<number, PronosticLite> = {};
          proData.forEach((p: any) => {
            map[p.id] = { id: p.id, match_name: p.match_name, league: p.league };
          });
          setPronostics(map);
        }
      }
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce commentaire définitivement ?')) return;
    setDeletingId(id);
    await supabase.from('pronostic_comments').delete().eq('id', id);
    setDeletingId(null);
    loadData();
  }

  async function toggleFlag(comment: Comment) {
    setTogglingFlag(comment.id);
    await supabase.from('pronostic_comments').update({ flagged: !comment.flagged }).eq('id', comment.id);
    setTogglingFlag(null);
    loadData();
  }

  async function handleReply(parentComment: Comment) {
    if (!replyContent.trim()) return;
    if (replyContent.length > 500) return;
    setSubmittingReply(true);
    await supabase.from('pronostic_comments').insert({
      pronostic_id: parentComment.pronostic_id,
      user_name: 'Admin',
      user_email: admin?.email || null,
      content: replyContent.trim(),
      parent_id: parentComment.id,
      is_admin: true,
    });
    setReplyContent('');
    setReplyingId(null);
    loadData();
    setSubmittingReply(false);
  }

  const filtered = comments.filter((c) => {
    const q = filter.toLowerCase();
    const p = pronostics[c.pronostic_id];
    const matchesSearch =
      c.user_name.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (p?.match_name?.toLowerCase() || '').includes(q) ||
      (p?.league?.toLowerCase() || '').includes(q);
    const matchesFlag = flagFilter === 'all' || (flagFilter === 'flagged' && c.flagged);
    return matchesSearch && matchesFlag;
  });

  const rootComments = filtered.filter((c) => !c.parent_id);
  const repliesMap = filtered.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<number, Comment[]>);

  const today = new Date();
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 7);
  const recentCount = comments.filter((c) => new Date(c.created_at) >= last7).length;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!admin) return null;

  return (
    <div className="pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Commentaires</h1>
        <p className="text-sm text-slate-500 mt-1">Modérer et supprimer les commentaires des fiches pronostics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{comments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">7 derniers jours</p>
          <p className="text-2xl font-bold text-indigo-700">{recentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Aujourd&apos;hui</p>
          <p className="text-2xl font-bold text-emerald-600">
            {comments.filter((c) => new Date(c.created_at).toDateString() === today.toDateString()).length}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher par pseudo, contenu, match..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-full">
          <button
            onClick={() => setFlagFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${flagFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFlagFilter('flagged')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1 ${flagFilter === 'flagged' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-flag-line" /></span>
            Signalés
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {filter ? 'Aucun commentaire ne correspond à votre recherche' : 'Aucun commentaire pour le moment'}
            </div>
          ) : (
            <div className="space-y-0">
              {rootComments.map((c) => {
                const p = pronostics[c.pronostic_id];
                const replies = repliesMap[c.id] || [];
                return (
                  <div key={c.id} className="border-b border-slate-100 last:border-0">
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 mt-0.5">
                          {c.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-900">{c.user_name}</span>
                            {c.user_email && <span className="text-xs text-slate-400">{c.user_email}</span>}
                            <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                            {p && (
                              <Link
                                href={`/pronostic/${c.pronostic_id}`}
                                target="_blank"
                                className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
                              >
                                {p.match_name}
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 mt-1">{c.content}</p>

                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => setReplyingId(replyingId === c.id ? null : c.id)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                            >
                              <span className="w-4 h-4 flex items-center justify-center"><i className="ri-reply-line" /></span>
                              Répondre
                            </button>
                            <button
                              onClick={() => toggleFlag(c)}
                              disabled={togglingFlag === c.id}
                              className={`text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 ${c.flagged ? 'text-rose-600 hover:text-rose-800' : 'text-slate-400 hover:text-amber-600'}`}
                            >
                              {togglingFlag === c.id ? (
                                <i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center" />
                              ) : (
                                <span className="w-4 h-4 flex items-center justify-center"><i className={c.flagged ? 'ri-flag-fill' : 'ri-flag-line'} /></span>
                              )}
                              {c.flagged ? 'Signalé' : 'Signaler'}
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id}
                              className="text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {deletingId === c.id ? (
                                <i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center" />
                              ) : (
                                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line" /></span>
                              )}
                              Supprimer
                            </button>
                          </div>
                          {c.flagged && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full mt-2">
                              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-flag-fill" /></span>
                              Commentaire signalé comme inapproprié
                            </span>
                          )}

                          {replyingId === c.id && (
                            <div className="mt-3 bg-slate-50 rounded-lg p-3">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Votre réponse..."
                                maxLength={500}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs ${replyContent.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {replyContent.length}/500
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => { setReplyingId(null); setReplyContent(''); }}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleReply(c)}
                                    disabled={submittingReply || !replyContent.trim()}
                                    className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-semibold rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {submittingReply ? 'Envoi...' : 'Envoyer'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {replies.length > 0 && (
                      <div className="pl-12 pr-4 pb-3 space-y-2">
                        {replies.map((r) => (
                          <div key={r.id} className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
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
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50 shrink-0"
                              title="Supprimer"
                            >
                              {deletingId === r.id ? (
                                <i className="ri-loader-4-line animate-spin text-xs" />
                              ) : (
                                <i className="ri-delete-bin-line text-xs" />
                              )}
                            </button>
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
    </div>
  );
}
