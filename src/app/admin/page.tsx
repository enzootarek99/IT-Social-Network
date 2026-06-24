'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate, truncateText } from '@/lib/utils';

type AdminData = {
  stats: {
    userCount: number;
    postCount: number;
    commentCount: number;
    opportunityCount: number;
    eventCount: number;
    conversationCount: number;
    messageCount: number;
    notificationCount: number;
    reportCount: number;
    reviewCount: number;
  };
  users: Array<AuthUser & { _count: { posts: number; followers: number; opportunities: number; organizedEvents: number } }>;
  posts: Array<{ id: string; content: string; createdAt: string; author: AuthUser; _count: { comments: number; likes: number } }>;
  comments: Array<{ id: string; content: string; createdAt: string; author: AuthUser; post: { id: string; content: string; author: AuthUser } }>;
  opportunities: Array<{ id: string; title: string; company: string; createdAt: string; author: AuthUser; _count: { applications: number } }>;
  events: Array<{ id: string; title: string; startsAt: string; organizer: AuthUser; _count: { attendees: number } }>;
  conversations: Array<{ id: string; updatedAt: string; participantA: AuthUser; participantB: AuthUser; _count: { messages: number } }>;
  messages: Array<{ id: string; content: string; createdAt: string; sender: AuthUser; conversation: { participantA: AuthUser; participantB: AuthUser } }>;
  notifications: Array<{ id: string; type: string; message: string; createdAt: string; recipient: AuthUser; actor?: AuthUser | null }>;
  reports: Array<{ id: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string; reporter: AuthUser }>;
  reviews: Array<{ id: string; rating: number; comment: string; createdAt: string; reviewer: AuthUser; opportunity: { id: string; title: string } }>;
};

const statLabels = {
  userCount: 'Utilisateurs',
  postCount: 'Posts',
  commentCount: 'Commentaires',
  opportunityCount: 'Missions',
  eventCount: 'Événements',
  conversationCount: 'Conversations',
  messageCount: 'Messages',
  notificationCount: 'Notifications',
  reportCount: 'Signalements',
  reviewCount: 'Reviews',
} as const;

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string>();

  const loadAdmin = async () => {
    const response = await fetch('/api/admin', { cache: 'no-store' });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Chargement admin impossible');
    }

    setData(payload);
  };

  useEffect(() => {
    async function initializeAdmin() {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        return;
      }

      try {
        setError(undefined);
        await loadAdmin();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement admin impossible');
      }
    }

    void initializeAdmin();
  }, [isAuthenticated, user?.role]);

  const updateRole = async (userId: string, role: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Mise à jour impossible');
      return;
    }

    await loadAdmin();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Supprimer cet utilisateur et ses contenus ?')) {
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Suppression impossible');
      return;
    }

    await loadAdmin();
  };

  const deleteContent = async (contentType: string, contentId: string) => {
    if (!confirm('Supprimer ce contenu ?')) {
      return;
    }

    const response = await fetch(`/api/admin/content/${contentType}/${contentId}`, {
      method: 'DELETE',
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Suppression impossible');
      return;
    }

    await loadAdmin();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Accès admin requis</h1>
        <p className="mt-4 text-slate-600">Connectez-vous avec un compte administrateur.</p>
        <Link
          href="/admin/login"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Connexion admin
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0d] text-[#d0d0dc]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#1a1a20] bg-[#080809] text-white lg:flex lg:flex-col">
          <div className="border-b border-[#1a1a20] p-5">
            <Link href="/admin" className="flex items-center gap-2 font-['Space_Grotesk'] text-lg font-semibold text-[#d0d0dc]">
              <span className="h-2 w-2 rounded-full bg-[#4f8ef7]" />
              NexusIT
              <span className="rounded bg-[#1a1a22] px-2 py-0.5 text-[10px] text-[#555]">Admin</span>
            </Link>
          </div>

          <div className="px-3 py-4">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#333]">Général</p>
            <nav className="space-y-1">
              {[
                { href: '/admin', label: 'Dashboard', badge: '' },
                { href: '#users', label: 'Utilisateurs', badge: String(data?.users.length || 0) },
                { href: '#content', label: 'Posts', badge: '' },
                { href: '#moderation', label: 'Modération', badge: String((data?.comments.length || 0) + (data?.messages.length || 0)) },
              ].map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    index === 0 ? 'bg-[#12121a] text-[#d0d0dc]' : 'text-[#666] hover:bg-[#12121a] hover:text-[#d0d0dc]'
                  }`}
                >
                  <span className={index === 0 ? 'text-[#4f8ef7]' : 'text-[#444]'}>●</span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-[#1d2a40] px-2 py-0.5 text-[10px] text-[#4f8ef7]">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>

            <p className="mt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#333]">Modules</p>
            <nav className="space-y-1">
              {[
                { href: '/marketplace', label: 'Freelance' },
                { href: '/events', label: 'Événements' },
                { href: '/messages', label: 'Messages' },
                { href: '/admin/appearance', label: 'Apparence' },
                { href: '/admin/pages', label: 'Pages statiques' },
                { href: '/admin/roles', label: 'Rôles & permissions' },
                { href: '/admin/logs', label: 'Logs & activité' },
                { href: '/', label: 'Voir le site' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-[#666] hover:bg-[#12121a] hover:text-[#d0d0dc]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-[#1a1a20] p-5 text-sm text-[#888]">
            Connecté en tant que
            <p className="mt-1 font-semibold text-[#d0d0dc]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#444]">Super Admin</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg border border-[#1e1e24] px-4 py-2 text-left text-xs font-semibold text-[#888] hover:bg-[#12121a] hover:text-[#d0d0dc]"
            >
              Déconnexion admin
            </button>
          </div>
        </aside>

        <section className="flex-1 bg-[#0a0a0d]">
          <div className="border-b border-[#1a1a20] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-[#e8e8f0]">Dashboard</h1>
                <p className="mt-1 text-xs text-[#555]">Vue d’ensemble · back-office NexusIT</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-2 text-xs text-[#555] sm:block">
                  Rechercher...
                </div>
                <button className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-xs font-semibold text-white">Export</button>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0d] p-5 lg:hidden">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#4f8ef7]">Admin</p>
              <h1 className="text-2xl font-bold text-[#e8e8f0]">Back-office</h1>
            </div>
            <Link href="/" className="rounded-full border border-[#1e1e24] px-4 py-2 text-sm font-semibold text-[#888]">
              Site
            </Link>
          </div>

          <div className="px-5 pb-8">
          {error && <div className="mt-6 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div>}

          {!data ? (
            <div className="mt-8 rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-8 text-center text-[#666]">
              Chargement du panel admin...
            </div>
          ) : (
            <>
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statLabels).map(([key, label]) => (
              <div key={key} className="rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-4">
                <p className="flex items-center justify-between text-xs text-[#555]">{label}<span className="text-[#444]">●</span></p>
                <p className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-[#e8e8f0]">
                  {data.stats[key as keyof typeof statLabels]}
                </p>
                <p className="mt-1 text-xs text-[#2dd4a0]">+ actif</p>
              </div>
            ))}
          </section>

          <section id="users" className="mt-6 rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-5">
            <h2 className="text-sm font-semibold text-[#d0d0dc]">Gestion des utilisateurs</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-[#444]">
                  <tr>
                    <th className="py-3">Utilisateur</th>
                    <th>Rôle</th>
                    <th>Stats</th>
                    <th>Créé</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.users.map((item) => (
                    <tr key={item.id} className="border-t border-[#111115]">
                      <td className="py-4">
                        <Link href={`/profile/${item.username}`} className="font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]">
                          {item.firstName} {item.lastName}
                        </Link>
                        <p className="text-xs text-[#444]">{item.email}</p>
                      </td>
                      <td>
                        <select
                          value={item.role || 'USER'}
                          onChange={(event) => void updateRole(item.id, event.target.value)}
                          className="rounded-full border border-[#1e1e24] bg-[#131318] px-3 py-2 text-[#888]"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="text-[#888]">
                        {item._count.posts} posts · {item._count.followers} abonnés
                      </td>
                      <td className="text-[#888]">
                        {item.createdAt ? formatDate(item.createdAt) : '-'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => void deleteUser(item.id)}
                          className="rounded-full border border-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="content" className="mt-6 grid gap-4 lg:grid-cols-4">
            <AdminContentPanel title="Posts">
              {data.posts.map((post) => (
                <ModerationItem
                  key={post.id}
                  title={truncateText(post.content, 80)}
                  meta={`${post.author.firstName} ${post.author.lastName} · ${formatDate(post.createdAt)}`}
                  onDelete={() => void deleteContent('posts', post.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Commentaires">
              {data.comments.map((comment) => (
                <ModerationItem
                  key={comment.id}
                  title={truncateText(comment.content, 80)}
                  meta={`${comment.author.firstName} ${comment.author.lastName} · sur "${truncateText(comment.post.content, 40)}"`}
                  href={`/profile/${comment.post.author.username}`}
                  onDelete={() => void deleteContent('comments', comment.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Missions">
              {data.opportunities.map((opportunity) => (
                <ModerationItem
                  key={opportunity.id}
                  title={opportunity.title}
                  meta={`${opportunity.company} · ${opportunity._count.applications} candidature(s)`}
                  href={`/marketplace/${opportunity.id}`}
                  onDelete={() => void deleteContent('opportunities', opportunity.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Événements">
              {data.events.map((event) => (
                <ModerationItem
                  key={event.id}
                  title={event.title}
                  meta={`${formatDate(event.startsAt)} · ${event._count.attendees} participant(s)`}
                  href={`/events/${event.id}`}
                  onDelete={() => void deleteContent('events', event.id)}
                />
              ))}
            </AdminContentPanel>
          </section>

          <section id="moderation" className="mt-6 grid gap-4 lg:grid-cols-3">
            <AdminContentPanel title="Conversations">
              {data.conversations.map((conversation) => (
                <ModerationItem
                  key={conversation.id}
                  title={`${conversation.participantA.firstName} ${conversation.participantA.lastName} ↔ ${conversation.participantB.firstName} ${conversation.participantB.lastName}`}
                  meta={`${conversation._count.messages} message(s) · ${formatDate(conversation.updatedAt)}`}
                  onDelete={() => void deleteContent('conversations', conversation.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Messages">
              {data.messages.map((message) => (
                <ModerationItem
                  key={message.id}
                  title={truncateText(message.content, 80)}
                  meta={`${message.sender.firstName} ${message.sender.lastName} · ${formatDate(message.createdAt)}`}
                  onDelete={() => void deleteContent('messages', message.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Notifications">
              {data.notifications.map((notification) => (
                <ModerationItem
                  key={notification.id}
                  title={truncateText(notification.message, 80)}
                  meta={`${notification.type} · pour ${notification.recipient.firstName} ${notification.recipient.lastName}`}
                  onDelete={() => void deleteContent('notifications', notification.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Signalements">
              {data.reports.map((report) => (
                <ModerationItem
                  key={report.id}
                  title={`${report.targetType} · ${truncateText(report.reason, 70)}`}
                  meta={`${report.status} · par ${report.reporter.firstName} ${report.reporter.lastName} · ${formatDate(report.createdAt)}`}
                  onDelete={() => void deleteContent('reports', report.id)}
                />
              ))}
            </AdminContentPanel>

            <AdminContentPanel title="Reviews">
              {data.reviews.map((review) => (
                <ModerationItem
                  key={review.id}
                  title={`★ ${review.rating} · ${truncateText(review.comment, 70)}`}
                  meta={`${review.opportunity.title} · par ${review.reviewer.firstName} ${review.reviewer.lastName}`}
                  href={`/marketplace/${review.opportunity.id}`}
                  onDelete={() => void deleteContent('reviews', review.id)}
                />
              ))}
            </AdminContentPanel>
          </section>
            </>
          )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminContentPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-5">
      <h2 className="text-sm font-semibold text-[#d0d0dc]">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function ModerationItem({
  title,
  meta,
  href,
  onDelete,
}: {
  title: string;
  meta: string;
  href?: string;
  onDelete: () => void;
}) {
  const content = (
    <>
      <p className="font-semibold text-[#d0d0dc]">{title}</p>
      <p className="mt-1 text-xs text-[#555]">{meta}</p>
    </>
  );

  return (
    <article className="rounded-lg border border-[#1e1e24] bg-[#131318] p-4">
      {href ? (
        <Link href={href} className="block hover:text-[#4f8ef7]">
          {content}
        </Link>
      ) : (
        content
      )}
      <button
        type="button"
        onClick={onDelete}
        className="mt-3 rounded-full border border-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40"
      >
        Supprimer
      </button>
    </article>
  );
}
