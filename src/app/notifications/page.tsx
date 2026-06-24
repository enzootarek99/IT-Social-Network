'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type Notification = {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
  actor?: AuthUser | null;
};

const typeLabels: Record<string, string> = {
  follow: 'Réseau',
  comment: 'Feed',
  application: 'Freelance',
  event_attendance: 'Événement',
};

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string>();
  const [isFetching, setIsFetching] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(undefined);
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chargement impossible');
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadNotifications();
    } else if (!isLoading) {
      setIsFetching(false);
    }
  }, [isAuthenticated, isLoading, loadNotifications]);

  const markAsRead = async (notificationId?: string) => {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationId ? { notificationId } : {}),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Mise à jour impossible');
      return;
    }

    setUnreadCount(data.unreadCount);
    setNotifications((current) =>
      current.map((notification) =>
        notificationId && notification.id !== notificationId
          ? notification
          : { ...notification, read: true },
      ),
    );
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Connectez-vous pour voir vos notifications</h1>
        <p className="mt-4 text-slate-600">
          Les notifications regroupent les commentaires, follows, candidatures et participations.
        </p>
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
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
            Notifications
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Votre activité récente</h1>
          <p className="mt-3 text-slate-600">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s).`
              : 'Vous êtes à jour.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void markAsRead()}
          disabled={unreadCount === 0}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Tout marquer comme lu
        </button>
      </div>

      {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="mt-8 space-y-4">
        {isFetching ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
            Chargement des notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            const content = (
              <article
                className={`rounded-3xl border p-5 shadow-soft transition ${
                  notification.read
                    ? 'border-slate-100 bg-white'
                    : 'border-blue-100 bg-blue-50/70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                      {typeLabels[notification.type] || notification.type}
                    </span>
                    <p className="mt-3 font-semibold text-slate-900">{notification.message}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        void markAsRead(notification.id);
                      }}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </article>
            );

            return notification.link ? (
              <Link key={notification.id} href={notification.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
            Aucune notification pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}
