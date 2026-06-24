'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type ProfilePost = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  _count: {
    comments: number;
    likes: number;
  };
};

type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  description: string;
};

type EducationItem = {
  degree: string;
  school: string;
  period: string;
  description: string;
};

type PortfolioItem = {
  title: string;
  url: string;
  description: string;
};

type PublicProfile = AuthUser & {
  posts: ProfilePost[];
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

function parseArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(undefined);
        const response = await fetch(`/api/profile?username=${encodeURIComponent(params.username)}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Profil introuvable');
        }

        setProfile(data.user);

        if (isAuthenticated) {
          const followResponse = await fetch(`/api/follow?userId=${encodeURIComponent(data.user.id)}`, {
            cache: 'no-store',
          });
          const followData = await followResponse.json();

          if (followResponse.ok) {
            setIsFollowing(
              followData.followers.some((follower: { id: string }) => follower.id === user?.id),
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Profil introuvable');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [isAuthenticated, params.username, user?.id]);

  const toggleFollow = async () => {
    if (!profile) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(undefined);
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: profile.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action impossible');
      }

      setIsFollowing(data.following);
      setProfile((current) =>
        current
          ? {
              ...current,
              _count: {
                ...current._count,
                followers: Math.max(0, current._count.followers + (data.following ? 1 : -1)),
              },
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">
        Chargement du profil...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Profil introuvable</h1>
        <p className="mt-4 text-slate-600">{error || 'Ce profil n’existe pas.'}</p>
        <Link
          href="/network"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Retour au réseau
        </Link>
      </main>
    );
  }

  const isOwnProfile = user?.id === profile.id;
  const experience = parseArray<ExperienceItem>(profile.experience);
  const education = parseArray<EducationItem>(profile.education);
  const portfolio = parseArray<PortfolioItem>(profile.portfolio);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-black text-blue-700">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              initials(profile.firstName, profile.lastName)
            )}
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="mt-2 text-blue-700">{profile.title || 'Professionnel IT'}</p>
          <p className="mt-1 text-sm text-slate-500">
            @{profile.username}
            {profile.company ? ` · ${profile.company}` : ''}
          </p>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {profile.bio || 'Ce profil complète encore sa présentation.'}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xl font-bold">{profile._count.posts}</p>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xl font-bold">{profile._count.followers}</p>
              <p className="text-xs text-slate-500">Abonnés</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xl font-bold">{profile._count.following}</p>
              <p className="text-xs text-slate-500">Suit</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {skill}
              </span>
            ))}
          </div>

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              Voir le portfolio
            </a>
          )}

          {isAuthenticated && !isOwnProfile && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={toggleFollow}
                className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${
                  isFollowing
                    ? 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Ne plus suivre' : 'Suivre'}
              </button>
              <Link
                href={`/messages?userId=${profile.id}`}
                className="inline-flex w-full justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Contacter
              </Link>
            </div>
          )}
        </aside>

        <section>
          <div className="mb-8 space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-900">Expériences</h2>
              <div className="mt-5 space-y-5">
                {experience.length > 0 ? (
                  experience.map((item, index) => (
                    <article key={`${item.company}-${item.role}-${index}`} className="border-l-4 border-blue-100 pl-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{item.role || 'Poste'}</h3>
                          <p className="text-sm text-blue-700">{item.company || 'Entreprise'}</p>
                        </div>
                        {item.period && (
                          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                            {item.period}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aucune expérience ajoutée.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-900">Formations</h2>
              <div className="mt-5 space-y-5">
                {education.length > 0 ? (
                  education.map((item, index) => (
                    <article key={`${item.school}-${item.degree}-${index}`} className="border-l-4 border-green-100 pl-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{item.degree || 'Formation'}</h3>
                          <p className="text-sm text-green-700">{item.school || 'Établissement'}</p>
                        </div>
                        {item.period && (
                          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                            {item.period}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aucune formation ajoutée.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-900">Portfolio</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {portfolio.length > 0 ? (
                  portfolio.map((item, index) => (
                    <article key={`${item.title}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-900">{item.title || 'Projet'}</h3>
                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Voir le projet
                        </a>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 sm:col-span-2">Aucun projet ajouté.</p>
                )}
              </div>
            </section>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
              Publications
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Activité récente</h2>
          </div>

          <div className="space-y-5">
            {profile.posts.length > 0 ? (
              profile.posts.map((post) => (
                <article key={post.id} className="rounded-3xl bg-white p-6 shadow-soft">
                  <p className="whitespace-pre-wrap text-slate-700">{post.content}</p>
                  {post.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="mt-5 max-h-80 w-full rounded-2xl object-cover"
                    />
                  )}
                  <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    {formatDate(post.createdAt)} · {post._count.likes} j’aime ·{' '}
                    {post._count.comments} commentaires
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
                Aucune publication récente.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
