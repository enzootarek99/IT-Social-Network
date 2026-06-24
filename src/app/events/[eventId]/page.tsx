'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type EventAttendee = {
  id: string;
  createdAt: string;
  user: AuthUser;
};

type EventDetail = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string | null;
  online: boolean;
  url?: string | null;
  organizer: AuthUser;
  attendees: EventAttendee[];
  attendingByMe: boolean;
  isOrganizer: boolean;
  _count: {
    attendees: number;
  };
};

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    startsAt: '',
    endsAt: '',
    online: false,
    url: '',
  });
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const response = await fetch(`/api/events/${params.eventId}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Événement introuvable');
      }

      setEvent(data.event);
      setEditForm({
        title: data.event.title,
        description: data.event.description,
        location: data.event.location,
        startsAt: new Date(data.event.startsAt).toISOString().slice(0, 16),
        endsAt: data.event.endsAt ? new Date(data.event.endsAt).toISOString().slice(0, 16) : '',
        online: data.event.online,
        url: data.event.url || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Événement introuvable');
    } finally {
      setIsLoading(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  const toggleAttendance = async () => {
    if (!event) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(undefined);
      const response = await fetch(`/api/events/${event.id}/attend`, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Participation impossible');
      }

      setEvent((current) =>
        current
          ? {
              ...current,
              attendingByMe: data.attending,
              _count: {
                attendees: Math.max(0, current._count.attendees + (data.attending ? 1 : -1)),
              },
            }
          : current,
      );
      await loadEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Participation impossible');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEvent = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!event) {
      return;
    }

    try {
      setStatus(undefined);
      setError(undefined);
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible');
      }

      setEvent((current) => (current ? { ...current, ...data.event } : current));
      setStatus('Événement mis à jour.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification impossible');
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !confirm('Supprimer cet événement ?')) {
      return;
    }

    try {
      setError(undefined);
      const response = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible');
      }

      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">
        Chargement de l’événement...
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Événement introuvable</h1>
        <p className="mt-4 text-slate-600">{error}</p>
        <Link
          href="/events"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Retour aux événements
        </Link>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/events" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
        ← Retour aux événements
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
            {event.online ? 'Événement en ligne' : 'Événement présentiel'}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">{event.title}</h1>
          <p className="mt-4 text-slate-500">
            {formatDate(event.startsAt)} · {event.online ? 'En ligne' : event.location}
          </p>

          <p className="mt-8 whitespace-pre-wrap leading-7 text-slate-700">{event.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Lieu</p>
              <p className="mt-1 font-semibold text-slate-900">{event.location}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Participants</p>
              <p className="mt-1 font-semibold text-slate-900">
                {event._count.attendees} inscrit(s)
              </p>
            </div>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-5 text-sm text-slate-500">
            Organisé par{' '}
            <Link
              href={`/profile/${event.organizer.username}`}
              className="font-semibold text-blue-700 hover:text-blue-900"
            >
              {event.organizer.firstName} {event.organizer.lastName}
            </Link>
          </p>
        </section>

        <aside className="space-y-6">
          {event.isOrganizer && (
            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Gérer l’événement</h2>
              <form onSubmit={handleUpdateEvent} className="mt-4 space-y-3">
                <input
                  value={editForm.title}
                  onChange={(inputEvent) => setEditForm((current) => ({ ...current, title: inputEvent.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  placeholder="Titre"
                />
                <textarea
                  value={editForm.description}
                  onChange={(inputEvent) =>
                    setEditForm((current) => ({ ...current, description: inputEvent.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  rows={4}
                  placeholder="Description"
                />
                <input
                  value={editForm.location}
                  onChange={(inputEvent) => setEditForm((current) => ({ ...current, location: inputEvent.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  placeholder="Lieu"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="datetime-local"
                    value={editForm.startsAt}
                    onChange={(inputEvent) => setEditForm((current) => ({ ...current, startsAt: inputEvent.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  />
                  <input
                    type="datetime-local"
                    value={editForm.endsAt}
                    onChange={(inputEvent) => setEditForm((current) => ({ ...current, endsAt: inputEvent.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  />
                </div>
                <input
                  value={editForm.url}
                  onChange={(inputEvent) => setEditForm((current) => ({ ...current, url: inputEvent.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  placeholder="Lien"
                />
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.online}
                    onChange={(inputEvent) => setEditForm((current) => ({ ...current, online: inputEvent.target.checked }))}
                  />
                  Événement en ligne
                </label>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
                {status && <p className="text-sm text-green-700">{status}</p>}
              </form>
            </section>
          )}

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Participer</h2>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full justify-center rounded-full border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Ouvrir le lien de l’événement
              </a>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={toggleAttendance}
                className={`mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${
                  event.attendingByMe
                    ? 'border border-green-200 bg-white text-green-700 hover:bg-green-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {event.attendingByMe ? 'Annuler ma participation' : 'Je participe'}
              </button>
            ) : (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
                <p>Connectez-vous pour confirmer votre participation.</p>
                <Link href="/login" className="mt-2 inline-flex font-semibold text-blue-700">
                  Se connecter
                </Link>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Participants</h2>
            <div className="mt-4 space-y-3">
              {event.attendees.length > 0 ? (
                event.attendees.map((attendee) => (
                  <Link
                    key={attendee.id}
                    href={`/profile/${attendee.user.username}`}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 hover:bg-blue-50"
                  >
                    <span>
                      <span className="font-semibold text-slate-900">
                        {attendee.user.firstName} {attendee.user.lastName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {attendee.user.title || 'Professionnel IT'}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(attendee.createdAt)}</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun participant pour le moment.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
