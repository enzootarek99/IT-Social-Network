'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string | null;
  online: boolean;
  url?: string | null;
  organizer: AuthUser;
  _count: {
    attendees: number;
  };
};

const emptyEventForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
  online: false,
  url: '',
};

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [form, setForm] = useState(emptyEventForm);
  const [query, setQuery] = useState('');
  const [onlineFilter, setOnlineFilter] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState('upcoming');
  const [attendingEvents, setAttendingEvents] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const params = new URLSearchParams();

        if (query) params.set('q', query);
        if (onlineFilter) params.set('online', onlineFilter);
        if (timeframeFilter) params.set('timeframe', timeframeFilter);

        const response = await fetch(`/api/events?${params.toString()}`, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Chargement impossible');
        }

        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvents();
  }, [onlineFilter, query, timeframeFilter]);

  const updateForm = (field: keyof typeof emptyEventForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Création impossible');
      }

      setEvents((current) => [data.event, ...current]);
      setForm(emptyEventForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    }
  };

  const toggleAttendance = async (eventId: string) => {
    if (!isAuthenticated) {
      return;
    }

    const response = await fetch(`/api/events/${eventId}/attend`, { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Participation impossible');
      return;
    }

    setAttendingEvents((current) => ({ ...current, [eventId]: data.attending }));
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              _count: {
                attendees: Math.max(0, event._count.attendees + (data.attending ? 1 : -1)),
              },
            }
          : event,
      ),
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
            Événements IT
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Meetups, conférences et ateliers</h1>
          <p className="mt-4 text-slate-600">
            Organisez les rendez-vous de la communauté: conférences, sessions de pair programming,
            talks techniques ou événements en ligne.
          </p>

          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Créer un événement</h2>
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="Titre de l’événement"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                rows={4}
                placeholder="Description"
                required
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  value={form.location}
                  onChange={(event) => updateForm('location', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  placeholder="Lieu"
                  required
                />
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => updateForm('startsAt', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  required
                />
              </div>
              <input
                value={form.url}
                onChange={(event) => updateForm('url', event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="Lien d’inscription ou visio"
              />
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.online}
                  onChange={(event) => updateForm('online', event.target.checked)}
                  className="h-4 w-4"
                />
                Événement en ligne
              </label>
              {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
              <button className="mt-5 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Créer
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-3xl bg-blue-50 p-6 text-blue-900">
              <p className="font-semibold">Connectez-vous pour organiser un événement.</p>
              <Link href="/login" className="mt-3 inline-flex font-semibold text-blue-700">
                Se connecter
              </Link>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <form
            className="grid gap-3 rounded-3xl bg-white p-4 shadow-soft md:grid-cols-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500 md:col-span-2"
              placeholder="Rechercher un événement"
            />
            <select
              value={onlineFilter}
              onChange={(event) => setOnlineFilter(event.target.value)}
              className="rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500"
            >
              <option value="">Tous les formats</option>
              <option value="true">En ligne</option>
              <option value="false">Présentiel</option>
            </select>
            <select
              value={timeframeFilter}
              onChange={(event) => setTimeframeFilter(event.target.value)}
              className="rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500"
            >
              <option value="upcoming">À venir</option>
              <option value="past">Passés</option>
              <option value="all">Tous</option>
            </select>
          </form>

          {isLoading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
              Chargement des événements...
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className="rounded-3xl bg-white p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xl font-bold text-slate-900 hover:text-blue-700"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.online ? 'En ligne' : event.location} · {formatDate(event.startsAt)}
                    </p>
                  </div>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Lien
                    </a>
                  )}
                </div>
                <p className="mt-4 text-slate-700">{event.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>
                    Organisé par {event.organizer.firstName} {event.organizer.lastName}
                  </span>
                  <span>{event._count.attendees} participant(s)</span>
                  <Link
                    href={`/events/${event.id}`}
                    className="font-semibold text-slate-700 hover:text-blue-700"
                  >
                    Voir le détail
                  </Link>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => void toggleAttendance(event.id)}
                      className={`font-semibold ${
                        attendingEvents[event.id]
                          ? 'text-green-700 hover:text-green-900'
                          : 'text-blue-700 hover:text-blue-900'
                      }`}
                    >
                      {attendingEvents[event.id] ? 'Participation confirmée' : 'Participer'}
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
              Aucun événement prévu.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
