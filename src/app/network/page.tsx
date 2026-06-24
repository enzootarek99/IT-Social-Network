'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/contexts';

type NetworkUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
  company?: string | null;
  location?: string | null;
  website?: string | null;
  skills: string[];
  followingByMe: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function NetworkPage() {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string>();

  const loadUsers = async (search = '') => {
    try {
      setIsLoading(true);
      setError(undefined);
      const suffix = search ? `?q=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/users${suffix}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chargement du réseau impossible');
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement du réseau impossible');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadUsers(query);
  };

  const toggleFollow = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      setError(undefined);
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action impossible');
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                followingByMe: data.following,
                _count: {
                  ...user._count,
                  followers: Math.max(0, user._count.followers + (data.following ? 1 : -1)),
                },
              }
            : user,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible');
    } finally {
      setUpdatingUserId(undefined);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Réseau</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Découvrez des professionnels IT
          </h1>
          <p className="mt-4 text-slate-600">
            Trouvez des développeurs, DevOps, data engineers et profils produit à suivre pour
            enrichir votre feed et créer de nouvelles opportunités.
          </p>

          {!isAuthenticated && (
            <div className="mt-8 rounded-3xl bg-blue-50 p-6 text-blue-900">
              <p className="font-semibold">Connectez-vous pour suivre des profils.</p>
              <Link href="/login" className="mt-3 inline-flex font-semibold text-blue-700">
                Se connecter
              </Link>
            </div>
          )}
        </section>

        <section>
          <form onSubmit={handleSearch} className="mb-6 flex gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500"
              placeholder="Rechercher par nom, rôle ou entreprise"
            />
            <button className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              Rechercher
            </button>
          </form>

          {error && <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-5 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft md:col-span-2">
                Chargement du réseau...
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <article key={user.id} className="rounded-3xl bg-white p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        initials(user.firstName, user.lastName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="text-sm text-blue-700">{user.title || 'Professionnel IT'}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        @{user.username}
                        {user.company ? ` · ${user.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {user.bio || 'Ce profil complète encore sa présentation.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-900">{user._count.posts}</p>
                      <p className="text-xs text-slate-500">Posts</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-900">{user._count.followers}</p>
                      <p className="text-xs text-slate-500">Abonnés</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-900">{user._count.following}</p>
                      <p className="text-xs text-slate-500">Suit</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isAuthenticated || updatingUserId === user.id}
                    onClick={() => void toggleFollow(user.id)}
                    className={`mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${
                      user.followingByMe
                        ? 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {user.followingByMe ? 'Ne plus suivre' : 'Suivre'}
                  </button>
                </article>
              ))
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft md:col-span-2">
                Aucun profil trouvé.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
