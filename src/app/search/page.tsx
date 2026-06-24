'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import type { AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type SearchResults = {
  users: AuthUser[];
  posts: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: AuthUser;
    _count: { comments: number; likes: number };
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    company: string;
    budget: string;
    location: string;
    _count: { applications: number };
  }>;
  events: Array<{
    id: string;
    title: string;
    location: string;
    startsAt: string;
    online: boolean;
    _count: { attendees: number };
  }>;
};

const emptyResults: SearchResults = {
  users: [],
  posts: [],
  opportunities: [],
  events: [],
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);
      setHasSearched(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Recherche impossible');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recherche impossible');
    } finally {
      setIsLoading(false);
    }
  };

  const totalResults =
    results.users.length + results.posts.length + results.opportunities.length + results.events.length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Recherche</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-900">Recherche globale</h1>
      <p className="mt-4 text-slate-600">
        Recherchez des profils, publications, missions freelance et événements.
      </p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500"
          placeholder="Ex: Next.js, DevOps, meetup..."
        />
        <button className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
          Rechercher
        </button>
      </form>

      {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Recherche en cours...
        </div>
      ) : hasSearched && totalResults === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Aucun résultat trouvé.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Profils</h2>
            <div className="mt-4 space-y-3">
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{user.title || 'Professionnel IT'}</p>
                </Link>
              ))}
              {hasSearched && !results.users.length && (
                <p className="text-sm text-slate-500">Aucun profil.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Publications</h2>
            <div className="mt-4 space-y-3">
              {results.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/profile/${post.author.username}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="line-clamp-2 text-sm text-slate-700">{post.content}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {post.author.firstName} {post.author.lastName} · {formatDate(post.createdAt)}
                  </p>
                </Link>
              ))}
              {hasSearched && !results.posts.length && (
                <p className="text-sm text-slate-500">Aucune publication.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Missions</h2>
            <div className="mt-4 space-y-3">
              {results.opportunities.map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href={`/marketplace/${opportunity.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{opportunity.title}</p>
                  <p className="text-sm text-slate-500">
                    {opportunity.company} · {opportunity.location} · {opportunity.budget}
                  </p>
                </Link>
              ))}
              {hasSearched && !results.opportunities.length && (
                <p className="text-sm text-slate-500">Aucune mission.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Événements</h2>
            <div className="mt-4 space-y-3">
              {results.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {event.online ? 'En ligne' : event.location} · {formatDate(event.startsAt)}
                  </p>
                </Link>
              ))}
              {hasSearched && !results.events.length && (
                <p className="text-sm text-slate-500">Aucun événement.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
