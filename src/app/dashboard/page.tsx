'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type DashboardData = {
  stats: {
    postCount: number;
    followerCount: number;
    applicationCount: number;
    unreadNotificationCount: number;
    unreadMessageCount: number;
  };
  recentNotifications: Array<{ id: string; message: string; link?: string | null; createdAt: string }>;
  conversations: Array<{
    id: string;
    otherParticipant: AuthUser;
    lastMessage?: { content: string; createdAt: string } | null;
  }>;
  upcomingEvents: Array<{ id: string; title: string; startsAt: string; location: string; online: boolean }>;
  receivedApplications: Array<{
    id: string;
    message: string;
    createdAt: string;
    applicant: AuthUser;
    opportunity: { id: string; title: string };
  }>;
};

const statCards = [
  { key: 'postCount', label: 'Posts' },
  { key: 'followerCount', label: 'Abonnés' },
  { key: 'applicationCount', label: 'Candidatures reçues' },
  { key: 'unreadNotificationCount', label: 'Notifications non lues' },
  { key: 'unreadMessageCount', label: 'Messages non lus' },
] as const;

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadDashboard() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await fetch('/api/dashboard', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Dashboard impossible');
        }

        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Dashboard impossible');
      }
    }

    void loadDashboard();
  }, [isAuthenticated]);

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Connectez-vous pour voir le dashboard</h1>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Dashboard</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-900">Votre activité</h1>

      {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!data ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Chargement du dashboard...
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((card) => (
              <div key={card.key} className="rounded-3xl bg-white p-5 shadow-soft">
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{data.stats[card.key]}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <DashboardPanel title="Notifications" href="/notifications">
              {data.recentNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || '/notifications'}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(notification.createdAt)}</p>
                </Link>
              ))}
            </DashboardPanel>

            <DashboardPanel title="Messages" href="/messages">
              {data.conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages?conversationId=${conversation.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">
                    {conversation.otherParticipant.firstName} {conversation.otherParticipant.lastName}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                    {conversation.lastMessage?.content || 'Aucun message'}
                  </p>
                </Link>
              ))}
            </DashboardPanel>

            <DashboardPanel title="Événements à venir" href="/events">
              {data.upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(event.startsAt)} · {event.online ? 'En ligne' : event.location}
                  </p>
                </Link>
              ))}
            </DashboardPanel>

            <DashboardPanel title="Candidatures reçues" href="/marketplace">
              {data.receivedApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/marketplace/${application.opportunity.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{application.opportunity.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {application.applicant.firstName} {application.applicant.lastName} ·{' '}
                    {formatDate(application.createdAt)}
                  </p>
                </Link>
              ))}
            </DashboardPanel>
          </section>
        </>
      )}
    </main>
  );
}

function DashboardPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
          Voir tout
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {children || <p className="text-sm text-slate-500">Aucun élément.</p>}
      </div>
    </section>
  );
}
