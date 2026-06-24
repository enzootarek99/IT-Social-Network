'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
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

const categories = ['Tous', 'Meetup IT', 'CTF', 'LAN Party', 'Sport', 'Social', 'Conférence', 'En ligne'];

function coverClass(index: number) {
  const covers = [
    'from-[#0d2040] to-[#1d3a60]',
    'from-[#1a1030] to-[#2a1a50]',
    'from-[#1f1200] to-[#3a2000]',
    'from-[#0a2218] to-[#1a3a28]',
    'from-[#1f0a18] to-[#3a1028]',
  ];

  return covers[index % covers.length];
}

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

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
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
  }, [onlineFilter, query, timeframeFilter]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

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
    <main className="bg-[#0a0a0d] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] border border-[#1e1e24] bg-[#0a0a0d] shadow-2xl">
        <section className="border-b border-[#1a1a20] bg-[#0d0d12] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#e8e8f0]">
                Activités & événements
              </h1>
              <p className="mt-1 text-sm text-[#666]">
                {events.length || '—'} événements · meetups, CTF, LAN, social, conférences
              </p>
            </div>
            {isAuthenticated && (
              <span className="rounded-lg bg-[#2dd4a0] px-4 py-2 text-xs font-semibold text-[#04342c]">
                + Créer un événement
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3">
              <span className="text-[#444]">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-200 placeholder:text-[#555]"
                placeholder="Rechercher un événement..."
              />
            </div>
            <select
              value={onlineFilter}
              onChange={(event) => setOnlineFilter(event.target.value)}
              className="rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3 text-sm text-[#888]"
            >
              <option value="">Tous les formats</option>
              <option value="true">En ligne</option>
              <option value="false">Présentiel</option>
            </select>
            <select
              value={timeframeFilter}
              onChange={(event) => setTimeframeFilter(event.target.value)}
              className="rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3 text-sm text-[#888]"
            >
              <option value="upcoming">À venir</option>
              <option value="past">Passés</option>
              <option value="all">Tous</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === 'Tous') {
                    setQuery('');
                    setOnlineFilter('');
                  } else if (label === 'En ligne') {
                    setOnlineFilter('true');
                  } else {
                    setQuery(label);
                  }
                }}
                className={`rounded-full border px-3 py-1 text-xs ${
                  (label === 'Tous' && !query && !onlineFilter) ||
                  query === label ||
                  (label === 'En ligne' && onlineFilter === 'true')
                    ? 'border-[#1a3a28] bg-[#0a2218] text-[#2dd4a0]'
                    : 'border-[#1e1e24] text-[#666] hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_300px]">
          <section className="border-r border-[#1a1a20] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-[#666]">{events.length} événements trouvés</p>
              <div className="flex rounded-md bg-[#131318] p-1 text-xs">
                <span className="rounded bg-[#1a1a22] px-3 py-1 text-[#d0d0dc]">Grille</span>
                <span className="px-3 py-1 text-[#555]">Carte</span>
                <span className="px-3 py-1 text-[#555]">Liste</span>
              </div>
            </div>

            {isAuthenticated && (
              <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
                <h2 className="text-sm font-semibold text-[#e8e8f0]">Créer un événement</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                    placeholder="Titre de l’événement"
                    required
                  />
                  <input
                    value={form.location}
                    onChange={(event) => updateForm('location', event.target.value)}
                    className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                    placeholder="Lieu"
                    required
                  />
                </div>
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  className="mt-3 w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                  rows={4}
                  placeholder="Description"
                  required
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => updateForm('startsAt', event.target.value)}
                    className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                    required
                  />
                  <input
                    value={form.url}
                    onChange={(event) => updateForm('url', event.target.value)}
                    className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                    placeholder="Lien d’inscription ou visio"
                  />
                </div>
                <label className="mt-3 flex items-center gap-3 text-xs text-[#888]">
                  <input
                    type="checkbox"
                    checked={form.online}
                    onChange={(event) => updateForm('online', event.target.checked)}
                  />
                  Événement en ligne
                </label>
                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
                <button className="mt-4 rounded-lg bg-[#2dd4a0] px-4 py-2 text-xs font-semibold text-[#04342c]">
                  Créer
                </button>
              </form>
            )}

            {isLoading ? (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Chargement des événements...
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {events.map((event, index) => (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-xl border border-[#1a1a20] bg-[#0f0f14] transition hover:border-[#1a3a28]"
                  >
                    <div className={`flex h-24 items-end justify-between bg-gradient-to-br p-3 ${coverClass(index)}`}>
                      <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold text-[#2dd4a0]">
                        {event.online ? 'En ligne' : 'Activité'}
                      </span>
                      <span className="rounded bg-black/50 px-2 py-1 font-['Space_Grotesk'] text-[10px] text-slate-200">
                        {formatDate(event.startsAt)}
                      </span>
                    </div>

                    <div className="p-4">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-base font-semibold text-[#d0d0dc] hover:text-[#2dd4a0]"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-1 text-xs text-[#666]">
                        {event.online ? 'En ligne' : event.location} · {formatDate(event.startsAt)}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#666]">{event.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#141418] pt-3 text-xs text-[#555]">
                        <span>{event._count.attendees} participant(s)</span>
                        <Link href={`/events/${event.id}`} className="font-semibold text-[#2dd4a0]">
                          Voir le détail
                        </Link>
                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => void toggleAttendance(event.id)}
                            className={`font-semibold ${attendingEvents[event.id] ? 'text-[#2dd4a0]' : 'text-[#4f8ef7]'}`}
                          >
                            {attendingEvents[event.id] ? 'Participation confirmée' : 'Je viens'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Aucun événement prévu.
              </div>
            )}
          </section>

          <aside className="bg-[#0d0d10]">
            <div className="border-b border-[#1a1a20] p-4">
              <p className="text-sm font-semibold text-[#d0d0dc]">Carte des activités</p>
              <p className="mt-1 text-xs text-[#555]">Vue réseau local et événements à proximité</p>
            </div>
            <div className="relative h-72 overflow-hidden bg-[#0a0a0e]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#1a1a20_1px,transparent_1px),linear-gradient(90deg,#1a1a20_1px,transparent_1px)] [background-size:24px_24px]" />
              {events.slice(0, 5).map((event, index) => (
                <div
                  key={event.id}
                  className="absolute"
                  style={{ left: `${18 + index * 14}%`, top: `${24 + (index % 3) * 18}%` }}
                >
                  <div className="h-3 w-3 rounded-full border-2 border-[#2dd4a0] bg-[#0a2218]" />
                  <span className="mt-1 block rounded bg-[#0a2218] px-2 py-0.5 text-[10px] text-[#2dd4a0]">
                    {event.online ? 'Online' : event.location.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555]">À venir</p>
              <div className="space-y-3">
                {events.slice(0, 6).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex gap-3 border-b border-[#141418] pb-3 last:border-none"
                  >
                    <div className="w-10 shrink-0 text-center">
                      <p className="font-['Space_Grotesk'] text-lg font-semibold leading-none text-[#2dd4a0]">
                        {new Date(event.startsAt).getDate()}
                      </p>
                      <p className="text-[10px] uppercase text-[#444]">
                        {new Date(event.startsAt).toLocaleDateString('fr-FR', { month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-snug text-[#d0d0dc]">{event.title}</p>
                      <p className="mt-1 text-[11px] text-[#555]">
                        {event.online ? 'En ligne' : event.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
