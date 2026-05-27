'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface MatchEvent {
  id: number;
  minute: number;
  type: 'goal' | 'card' | 'substitution' | 'foul';
  description: string;
}

interface Comment {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

const MOCK_EVENTS: MatchEvent[] = [
  { id: 1, minute: 12, type: 'goal', description: 'BUT ! Mbappé ouvre le score pour Monaco' },
  { id: 2, minute: 23, type: 'card', description: 'Carton jaune pour Gueye (Marseille)' },
  { id: 3, minute: 34, type: 'goal', description: 'BUT ! Aubameyang égalise pour Marseille' },
  { id: 4, minute: 45, type: 'substitution', description: 'Changement : Ben Yedder remplace Embolo' },
  { id: 5, minute: 51, type: 'goal', description: "BUT ! Minamino redonne l'avantage à Monaco" },
  { id: 6, minute: 58, type: 'card', description: 'Carton jaune pour Kondogbia (Marseille)' },
  { id: 7, minute: 62, type: 'foul', description: 'Faute dangereuse sur Golovin, coup franc pour Monaco' },
  { id: 8, minute: 67, type: 'substitution', description: 'Changement : Sarr entre pour Harit' },
];

export default function MatchDetail({ matchId }: { matchId: string }) {
  const [minute, setMinute] = useState(67);
  const [homeScore] = useState(2);
  const [awayScore] = useState(1);
  const [events] = useState<MatchEvent[]>(MOCK_EVENTS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinute((prev) => (prev < 90 ? prev + 1 : prev));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadComments() {
      const { data } = await supabase
        .from('match_comments')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });
      if (data) setComments(data);
    }
    loadComments();

    const channel = supabase
      .channel('match_comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_comments', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setComments((prev) => [payload.new as Comment, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;
    setSending(true);
    const { data, error } = await supabase.from('match_comments').insert({
      match_id: matchId,
      user_name: userName.trim(),
      content: newComment.trim(),
    }).select('*').single();
    if (!error && data) {
      setComments((prev) => [data, ...prev]);
      setNewComment('');
    }
    setSending(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <span className="w-6 h-6 flex items-center justify-center text-emerald-600"><i className="ri-football-line" /></span>;
      case 'card':
        return <span className="w-6 h-6 flex items-center justify-center text-amber-500"><i className="ri-square-fill" /></span>;
      case 'substitution':
        return <span className="w-6 h-6 flex items-center justify-center text-indigo-600"><i className="ri-arrow-left-right-line" /></span>;
      case 'foul':
        return <span className="w-6 h-6 flex items-center justify-center text-red-500"><i className="ri-shield-cross-line" /></span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <Link href="/scores" className="text-sm font-medium text-indigo-700 hover:text-indigo-800 transition-colors mb-6 inline-flex items-center gap-1">
        <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line" /></span>
        Retour aux scores
      </Link>

      <div className="bg-white rounded-xl border-2 border-red-300 overflow-hidden mb-8">
        <div className="bg-red-50 px-5 py-2 flex items-center justify-between border-b border-red-100">
          <span className="text-xs font-semibold text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            EN DIRECT — Ligue 1
          </span>
          <span className="text-xs font-bold text-red-600">{minute}&apos;</span>
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-slate-900 mb-1">Monaco</p>
              <p className="text-4xl font-black text-indigo-700">{homeScore}</p>
            </div>
            <div className="px-4 text-center">
              <span className="text-xs font-medium text-slate-400">VS</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-slate-900 mb-1">Marseille</p>
              <p className="text-4xl font-black text-indigo-700">{awayScore}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Stade Louis II</span>
          <span className="text-xs text-slate-500">Temps réglementaire</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-list-check" /></span>
              <h2 className="text-sm font-semibold text-slate-900">Événements du match</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs font-bold text-slate-400 w-8">{event.minute}&apos;</span>
                  {getEventIcon(event.type)}
                  <span className="text-sm text-slate-700">{event.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center text-indigo-600"><i className="ri-chat-3-line" /></span>
              <h2 className="text-sm font-semibold text-slate-900">Commentaires</h2>
              <span className="text-xs text-slate-400 ml-auto">{comments.length} messages</span>
            </div>

            {!isOnline && (
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center"><i className="ri-wifi-off-line" /></span>
                  Vous êtes hors ligne. Reconnectez-vous pour commenter.
                </p>
              </div>
            )}

            <div className="px-5 py-4">
              {isOnline && (
                <form onSubmit={handleSendComment} className="mb-6 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Pseudo</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Votre pseudo"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Écrivez votre commentaire..."
                      maxLength={500}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </form>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">Soyez le premier à commenter !</p>
                )}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-900">{comment.user_name}</span>
                        <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Statistiques</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <StatRow label="Possession" home={58} away={42} />
              <StatRow label="Tirs" home={14} away={9} />
              <StatRow label="Tirs cadrés" home={6} away={3} />
              <StatRow label="Fautes" home={8} away={11} />
              <StatRow label="Corners" home={5} away={3} />
              <StatRow label="Cartons" home={1} away={2} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Compo Monaco</h2>
            </div>
            <div className="px-5 py-3 space-y-2">
              <p className="text-xs text-slate-500">Gardien</p>
              <p className="text-sm font-medium text-slate-900">Kohn</p>
              <p className="text-xs text-slate-500 mt-2">Défense</p>
              <p className="text-sm text-slate-700">Singos, Maripan, Mbemba, Henrique</p>
              <p className="text-xs text-slate-500 mt-2">Milieu</p>
              <p className="text-sm text-slate-700">Zakaria, Fofana, Golovin</p>
              <p className="text-xs text-slate-500 mt-2">Attaque</p>
              <p className="text-sm text-slate-700">Minamino, Mbappé, Ben Yedder</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Compo Marseille</h2>
            </div>
            <div className="px-5 py-3 space-y-2">
              <p className="text-xs text-slate-500">Gardien</p>
              <p className="text-sm font-medium text-slate-900">Lopez</p>
              <p className="text-xs text-slate-500 mt-2">Défense</p>
              <p className="text-sm text-slate-700">Kolasinac, Mbemba, Gigot, Clauss</p>
              <p className="text-xs text-slate-500 mt-2">Milieu</p>
              <p className="text-sm text-slate-700">Veretout, Rongier, Harit</p>
              <p className="text-xs text-slate-500 mt-2">Attaque</p>
              <p className="text-sm text-slate-700">Aubameyang, Sarr</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = total > 0 ? (away / total) * 100 : 50;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span>{home}</span>
        <span className="font-medium">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex items-center gap-1 h-2">
        <div className="h-full rounded-l bg-indigo-600 transition-all" style={{ width: `${homePct}%` }} />
        <div className="h-full rounded-r bg-slate-300 transition-all" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}
