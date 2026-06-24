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
    opportunityCount: number;
    eventCount: number;
    messageCount: number;
    notificationCount: number;
  };
  users: Array<AuthUser & { _count: { posts: number; followers: number; opportunities: number; organizedEvents: number } }>;
  posts: Array<{ id: string; content: string; createdAt: string; author: AuthUser; _count: { comments: number; likes: number } }>;
  opportunities: Array<{ id: string; title: string; company: string; createdAt: string; author: AuthUser; _count: { applications: number } }>;
  events: Array<{ id: string; title: string; startsAt: string; organizer: AuthUser; _count: { attendees: number } }>;
};

const statLabels = {
  userCount: 'Utilisateurs',
  postCount: 'Posts',
  opportunityCount: 'Missions',
  eventCount: 'Événements',
  messageCount: 'Messages',
  notificationCount: 'Notifications',
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 bg-slate-950 p-6 text-white lg:block">
          <Link href="/admin" className="text-2xl font-black">
            ITSN Admin
          </Link>
          <p className="mt-2 text-sm text-slate-400">Back-office séparé</p>

          <nav className="mt-10 space-y-2">
            {[
              { href: '/admin', label: 'Tableau de bord' },
              { href: '/', label: 'Voir le site' },
              { href: '/dashboard', label: 'Dashboard utilisateur' },
              { href: '/marketplace', label: 'Missions' },
              { href: '/events', label: 'Événements' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
            Connecté en tant que
            <p className="mt-1 font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-2xl border border-white/20 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10"
          >
            Déconnexion admin
          </button>
        </aside>

        <section className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-soft lg:hidden">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Admin</p>
              <h1 className="text-2xl font-bold text-slate-900">Back-office</h1>
            </div>
            <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              Site
            </Link>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Panel administrateur</h1>
          <p className="mt-4 text-slate-600">
            Supervisez les utilisateurs, contenus et indicateurs de la plateforme.
          </p>

          {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {!data ? (
            <div className="mt-8 rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
              Chargement du panel admin...
            </div>
          ) : (
            <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {Object.entries(statLabels).map(([key, label]) => (
              <div key={key} className="rounded-3xl bg-white p-5 shadow-soft">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {data.stats[key as keyof typeof statLabels]}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-bold text-slate-900">Utilisateurs</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-slate-500">
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
                    <tr key={item.id}>
                      <td className="py-4">
                        <Link href={`/profile/${item.username}`} className="font-semibold text-slate-900 hover:text-blue-700">
                          {item.firstName} {item.lastName}
                        </Link>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </td>
                      <td>
                        <select
                          value={item.role || 'USER'}
                          onChange={(event) => void updateRole(item.id, event.target.value)}
                          className="rounded-full border border-slate-200 px-3 py-2"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="text-slate-500">
                        {item._count.posts} posts · {item._count.followers} abonnés
                      </td>
                      <td className="text-slate-500">
                        {item.createdAt ? formatDate(item.createdAt) : '-'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => void deleteUser(item.id)}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
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
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminContentPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
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
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{meta}</p>
    </>
  );

  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      {href ? (
        <Link href={href} className="block hover:text-blue-700">
          {content}
        </Link>
      ) : (
        content
      )}
      <button
        type="button"
        onClick={onDelete}
        className="mt-3 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Supprimer
      </button>
    </article>
  );
}
